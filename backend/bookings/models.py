from django.conf import settings
from django.db import models


class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pending"      # awaiting payment, holds a seat
    CONFIRMED = "confirmed", "Confirmed"
    CANCELLED = "cancelled", "Cancelled"


class Booking(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    session = models.ForeignKey(
        "sessions_app.Session",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    status = models.CharField(
        max_length=10, choices=BookingStatus.choices, default=BookingStatus.PENDING
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stripe_checkout_id = models.CharField(max_length=255, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # A user may hold at most one non-cancelled booking per session.
            models.UniqueConstraint(
                fields=["user", "session"],
                condition=~models.Q(status="cancelled"),
                name="unique_active_booking_per_user_session",
            )
        ]

    def __str__(self):
        return f"{self.user} -> {self.session} ({self.status})"
