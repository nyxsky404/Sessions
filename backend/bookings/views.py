from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from common.permissions import IsCreator, IsUserRole
from sessions_app.models import Session

from .models import Booking, BookingStatus
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    CreatorBookingSerializer,
)
from .services import create_booking, expire_stale_pending


class BookingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "booking"
            return [ScopedRateThrottle()]
        return []

    def get_permissions(self):
        if self.action in ("create", "cancel"):
            return [IsUserRole()]
        return [IsAuthenticated()]

    def list(self, request):
        expire_stale_pending()
        qs = (
            Booking.objects.filter(user=request.user)
            .select_related("session", "session__creator")
        )
        now = timezone.now()
        which = request.query_params.get("filter")
        if which == "active":
            qs = qs.exclude(status=BookingStatus.CANCELLED).filter(
                session__start_time__gte=now
            )
        elif which == "past":
            from django.db.models import Q

            qs = qs.filter(
                Q(status=BookingStatus.CANCELLED) | Q(session__start_time__lt=now)
            )
        serializer = BookingSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def create(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session_id = serializer.validated_data["session_id"]
        get_object_or_404(Session, pk=session_id)
        booking = create_booking(request.user, session_id)
        out = BookingSerializer(booking, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)
        if booking.status == BookingStatus.CANCELLED:
            return Response(
                {"detail": "Booking already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = BookingStatus.CANCELLED
        booking.save(update_fields=["status"])
        return Response(
            BookingSerializer(booking, context={"request": request}).data
        )


class CreatorSessionBookingsView(APIView):
    """Bookings overview for one of the creator's own sessions."""

    permission_classes = [IsCreator]

    def get(self, request, session_id):
        session = get_object_or_404(Session, pk=session_id, creator=request.user)
        bookings = session.bookings.select_related("user").all()
        return Response(
            {
                "session": {"id": session.id, "title": session.title},
                "bookings": CreatorBookingSerializer(bookings, many=True).data,
            }
        )
