"""Booking creation logic with capacity + conflict guards (atomic)."""
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from sessions_app.models import Session

from .models import Booking, BookingStatus

# Unpaid (pending) bookings hold a seat for this long, then expire so the
# seat is freed for other users.
PENDING_TIMEOUT_MINUTES = 15
# Once Stripe checkout has started, the seat is held longer so a slow payment
# isn't cancelled out from under the customer (which would charge them with no
# booking). Must comfortably exceed the Stripe Checkout session lifetime.
CHECKOUT_TIMEOUT_MINUTES = 60


def expire_stale_pending(session_id=None):
    """Cancel abandoned pending bookings (frees seats).

    Bookings that never reached Stripe expire quickly; bookings already in
    checkout get a longer grace so an in-flight payment is never cancelled.
    """
    now = timezone.now()
    base = Booking.objects.filter(status=BookingStatus.PENDING)
    if session_id is not None:
        base = base.filter(session_id=session_id)

    not_started = base.filter(
        stripe_checkout_id="",
        created_at__lt=now - timedelta(minutes=PENDING_TIMEOUT_MINUTES),
    )
    in_checkout = base.exclude(stripe_checkout_id="").filter(
        created_at__lt=now - timedelta(minutes=CHECKOUT_TIMEOUT_MINUTES),
    )
    return not_started.update(status=BookingStatus.CANCELLED) + in_checkout.update(
        status=BookingStatus.CANCELLED
    )


def _has_time_conflict(user, session):
    """True if the user already holds an active booking that overlaps in time."""
    active = (
        Booking.objects.filter(user=user)
        .exclude(status=BookingStatus.CANCELLED)
        .select_related("session")
    )
    new_start = session.start_time
    new_end = session.end_time
    for booking in active:
        other = booking.session
        if other.start_time < new_end and session.start_time < other.end_time:
            return True
    return False


@transaction.atomic
def create_booking(user, session_id):
    """
    Create a booking, enforcing:
      - no double-booking of the same session (unique constraint + check)
      - no time-overlap with the user's other active bookings
      - seat capacity (row-locked)
    Free sessions are confirmed immediately; paid sessions start as pending.
    """
    # Free up seats held by abandoned (unpaid) reservations first.
    expire_stale_pending(session_id=session_id)

    session = Session.objects.select_for_update().get(pk=session_id)

    if session.creator_id == user.id:
        raise ValidationError("You cannot book your own session.")

    already = (
        Booking.objects.filter(user=user, session=session)
        .exclude(status=BookingStatus.CANCELLED)
        .exists()
    )
    if already:
        raise ValidationError("You have already booked this session.")

    if _has_time_conflict(user, session):
        raise ValidationError(
            "You already have a booking that overlaps with this session's time."
        )

    if session.seats_remaining <= 0:
        raise ValidationError("This session is fully booked.")

    booking = Booking.objects.create(
        user=user,
        session=session,
        status=BookingStatus.CONFIRMED if session.is_free else BookingStatus.PENDING,
        amount_paid=0,
    )
    return booking
