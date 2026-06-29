from rest_framework import serializers

from sessions_app.models import LocationType
from sessions_app.serializers import SessionSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    needs_payment = serializers.SerializerMethodField()
    # Logistics surfaced on the bookings list so attendees don't have to open
    # the detail page. Location specifics are revealed only for live bookings.
    duration_minutes = serializers.IntegerField(
        source="session.duration_minutes", read_only=True
    )
    location_type = serializers.CharField(
        source="session.location_type", read_only=True
    )
    venue_name = serializers.CharField(source="session.venue_name", read_only=True)
    meeting_link = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "session",
            "status",
            "amount_paid",
            "needs_payment",
            "duration_minutes",
            "location_type",
            "venue_name",
            "meeting_link",
            "full_address",
            "created_at",
        ]

    def get_needs_payment(self, obj):
        return obj.status == "pending" and not obj.session.is_free

    def _revealed(self, obj):
        # A held (pending) or confirmed booking entitles the attendee to the
        # joining details; cancelled bookings do not.
        return obj.status != "cancelled"

    def get_meeting_link(self, obj):
        if obj.session.location_type == LocationType.ONLINE and self._revealed(obj):
            return obj.session.location_text or None
        return None

    def get_full_address(self, obj):
        if obj.session.location_type != LocationType.ONLINE and self._revealed(obj):
            return obj.session.full_address or None
        return None


class BookingCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()


class CreatorBookingSerializer(serializers.ModelSerializer):
    """Booking row as seen by the creator (who booked)."""

    user_name = serializers.CharField(source="user.display_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "user_name", "user_email", "status", "amount_paid", "created_at"]
