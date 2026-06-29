import stripe
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from bookings.models import Booking, BookingStatus
from common.permissions import IsUserRole

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutView(APIView):
    """Create a Stripe Checkout session for a pending paid booking."""

    permission_classes = [IsAuthenticated, IsUserRole]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "checkout"

    def post(self, request):
        booking_id = request.data.get("booking_id")
        booking = get_object_or_404(
            Booking, pk=booking_id, user=request.user
        )
        if booking.status != BookingStatus.PENDING:
            return Response(
                {"detail": "Booking is not awaiting payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.session.is_free:
            return Response(
                {"detail": "This session is free."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = booking.session
        try:
            checkout = stripe.checkout.Session.create(
                mode="payment",
                line_items=[
                    {
                        "price_data": {
                            "currency": session.currency.lower(),
                            "product_data": {"name": session.title},
                            "unit_amount": int(session.price * 100),
                        },
                        "quantity": 1,
                    }
                ],
                metadata={"booking_id": str(booking.id)},
                success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success",
                cancel_url=f"{settings.FRONTEND_URL}/sessions/{session.id}?payment=cancelled",
            )
        except stripe.error.StripeError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY
            )

        booking.stripe_checkout_id = checkout.id
        booking.save(update_fields=["stripe_checkout_id"])
        return Response({"checkout_url": checkout.url})


class StripeWebhookView(APIView):
    """Confirm bookings when Stripe reports a completed checkout."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "checkout.session.completed":
            data = event["data"]["object"]
            booking_id = data.get("metadata", {}).get("booking_id")
            if booking_id:
                self._confirm_booking(booking_id, data)

        return Response(status=status.HTTP_200_OK)

    @staticmethod
    @transaction.atomic
    def _confirm_booking(booking_id, data):
        """Confirm a paid booking. Idempotent, and recovers a booking that was
        wrongly expired while still leaving a sold-out session alone (so a late
        payment never oversells)."""
        booking = (
            Booking.objects.select_for_update()
            .filter(id=booking_id)
            .select_related("session")
            .first()
        )
        if booking is None or booking.status == BookingStatus.CONFIRMED:
            return
        # If the hold expired but the seat was resold, don't oversell.
        if (
            booking.status == BookingStatus.CANCELLED
            and booking.session.seats_remaining <= 0
        ):
            return
        booking.status = BookingStatus.CONFIRMED
        booking.stripe_payment_intent_id = data.get("payment_intent", "")
        booking.amount_paid = (data.get("amount_total", 0) or 0) / 100
        booking.save(
            update_fields=["status", "stripe_payment_intent_id", "amount_paid", "updated_at"]
        )
