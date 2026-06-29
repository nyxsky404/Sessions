from django.utils import timezone
from rest_framework import serializers

from .models import LocationType, Session


class CreatorMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    display_name = serializers.CharField()
    avatar = serializers.ImageField()
    is_verified = serializers.BooleanField()


class CreatorDetailSerializer(serializers.Serializer):
    """Creator info for the session detail "About the creator" section."""

    id = serializers.IntegerField()
    display_name = serializers.CharField()
    avatar = serializers.ImageField()
    bio = serializers.CharField()
    years_experience = serializers.IntegerField()
    is_verified = serializers.BooleanField()
    sessions_hosted = serializers.SerializerMethodField()
    attendees_count = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    def get_sessions_hosted(self, obj):
        return obj.sessions.count()

    def get_attendees_count(self, obj):
        from bookings.models import Booking

        return (
            Booking.objects.filter(session__creator=obj)
            .exclude(status="cancelled")
            .count()
        )

    def _creator_reviews(self, obj):
        from reviews.models import Review

        return Review.objects.filter(session__creator=obj)

    def get_review_count(self, obj):
        return self._creator_reviews(obj).count()

    def get_rating(self, obj):
        from django.db.models import Avg

        avg = self._creator_reviews(obj).aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg is not None else None


class SessionSerializer(serializers.ModelSerializer):
    """Lightweight serializer for catalog list cards and nesting."""

    creator = CreatorMiniSerializer(read_only=True)
    # seats/rating/review_count prefer the per-page annotations set by the view
    # (see CARD_ANNOTATIONS) and fall back to the model properties for single
    # objects and nested cards that aren't annotated.
    seats_remaining = serializers.SerializerMethodField()
    is_free = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    active_bookings = serializers.IntegerField(read_only=True, default=0)
    viewer_booking = serializers.SerializerMethodField()

    def get_seats_remaining(self, obj):
        active = getattr(obj, "active_bookings", None)
        if active is None:
            return obj.seats_remaining
        return max(obj.capacity - active, 0)

    def get_avg_rating(self, obj):
        if hasattr(obj, "annotated_avg_rating"):
            avg = obj.annotated_avg_rating
            return round(avg, 1) if avg is not None else None
        return obj.avg_rating

    def get_review_count(self, obj):
        count = getattr(obj, "annotated_review_count", None)
        return count if count is not None else obj.review_count

    class Meta:
        model = Session
        fields = [
            "id",
            "creator",
            "title",
            "description",
            "category",
            "image",
            "price",
            "currency",
            "start_time",
            "duration_minutes",
            "capacity",
            "seats_remaining",
            "location_type",
            "location_text",
            "skill_level",
            "is_free",
            "avg_rating",
            "review_count",
            "active_bookings",
            "viewer_booking",
            "created_at",
        ]

    def get_image(self, obj):
        """Uploaded image if present, else the external (seed) cover URL."""
        if obj.image:
            request = self.context.get("request")
            return (
                request.build_absolute_uri(obj.image.url)
                if request
                else obj.image.url
            )
        return obj.image_url or None

    def get_viewer_booking(self, obj):
        """The current user's active booking for this session, if any."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        booking = (
            obj.bookings.filter(user=request.user)
            .exclude(status="cancelled")
            .order_by("-created_at")
            .first()
        )
        if not booking:
            return None
        return {"id": booking.id, "status": booking.status}


class SessionDetailSerializer(SessionSerializer):
    """Full serializer for the session detail page."""

    creator = CreatorDetailSerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    featured_reviews = serializers.SerializerMethodField()
    related_sessions = serializers.SerializerMethodField()
    creator_sessions = serializers.SerializerMethodField()
    location_locked = serializers.SerializerMethodField()
    location_text = serializers.SerializerMethodField()
    venue_name = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()

    class Meta(SessionSerializer.Meta):
        fields = SessionSerializer.Meta.fields + [
            "venue_name",
            "full_address",
            "language",
            "age_restriction",
            "cancellation_policy",
            "what_you_will_learn",
            "agenda",
            "whats_included",
            "what_to_bring",
            "faqs",
            "location_locked",
            "reviews",
            "featured_reviews",
            "related_sessions",
            "creator_sessions",
        ]

    # --- location gating -------------------------------------------------
    def _can_see_online_link(self, obj):
        """Online meeting links are only revealed after booking."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if obj.creator_id == request.user.id:
            return True
        return (
            obj.bookings.filter(user=request.user)
            .exclude(status="cancelled")
            .exists()
        )

    def get_location_locked(self, obj):
        if obj.location_type == LocationType.ONLINE:
            return not self._can_see_online_link(obj)
        return False

    def get_location_text(self, obj):
        if obj.location_type == LocationType.ONLINE:
            return obj.location_text if self._can_see_online_link(obj) else None
        return obj.location_text

    def get_venue_name(self, obj):
        return obj.venue_name

    def get_full_address(self, obj):
        return obj.full_address

    # --- reviews ---------------------------------------------------------
    def get_reviews(self, obj):
        from reviews.serializers import ReviewSerializer

        return ReviewSerializer(
            obj.reviews.select_related("author").all(), many=True
        ).data

    def get_featured_reviews(self, obj):
        from reviews.serializers import ReviewSerializer

        return ReviewSerializer(
            obj.reviews.select_related("author").filter(is_featured=True), many=True
        ).data

    # --- related ---------------------------------------------------------
    def _light(self, qs):
        return SessionSerializer(qs, many=True, context=self.context).data

    def get_related_sessions(self, obj):
        qs = (
            Session.objects.select_related("creator")
            .filter(category=obj.category, start_time__gte=timezone.now())
            .exclude(pk=obj.pk)[:4]
        )
        return self._light(qs)

    def get_creator_sessions(self, obj):
        qs = (
            Session.objects.select_related("creator")
            .filter(creator=obj.creator, start_time__gte=timezone.now())
            .exclude(pk=obj.pk)[:4]
        )
        return self._light(qs)


def _clean_str_list(value, field_label):
    """Validate a list of non-empty strings; require at least one item."""
    if not isinstance(value, list):
        raise serializers.ValidationError("Expected a list.")
    cleaned = [str(item).strip() for item in value if str(item).strip()]
    if not cleaned:
        raise serializers.ValidationError(f"Add at least one {field_label}.")
    return cleaned


class SessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            "title",
            "description",
            "category",
            "price",
            "currency",
            "start_time",
            "duration_minutes",
            "capacity",
            "location_type",
            "location_text",
            "venue_name",
            "full_address",
            "skill_level",
            "language",
            "age_restriction",
            "cancellation_policy",
            "what_you_will_learn",
            "agenda",
            "whats_included",
            "what_to_bring",
            "faqs",
        ]
        extra_kwargs = {
            # Core fields are mandatory (cover image is uploaded separately).
            "currency": {"required": True},
            "skill_level": {"required": True},
            "language": {"required": True, "allow_blank": False},
            "age_restriction": {"required": True},
            "cancellation_policy": {"required": True},
            # location_text / venue_name / full_address validated conditionally.
            "location_text": {"required": False, "allow_blank": True},
            "venue_name": {"required": False, "allow_blank": True},
            "full_address": {"required": False, "allow_blank": True},
        }

    def validate_start_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Start time must be in the future.")
        return value

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

    def validate_duration_minutes(self, value):
        if value < 10:
            raise serializers.ValidationError(
                "Duration must be at least 10 minutes."
            )
        return value

    def validate_what_you_will_learn(self, value):
        return _clean_str_list(value, "learning outcome")

    def validate_agenda(self, value):
        return _clean_str_list(value, "agenda item")

    def validate_whats_included(self, value):
        return _clean_str_list(value, "included item")

    def validate_what_to_bring(self, value):
        return _clean_str_list(value, "item to bring")

    def validate_faqs(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list.")
        cleaned = []
        for item in value:
            if not isinstance(item, dict):
                continue
            q = str(item.get("question", "")).strip()
            a = str(item.get("answer", "")).strip()
            if q and a:
                cleaned.append({"question": q, "answer": a})
        if not cleaned:
            raise serializers.ValidationError(
                "Add at least one FAQ with both a question and an answer."
            )
        return cleaned

    def validate(self, attrs):
        # Conditional location requirements.
        location_type = attrs.get(
            "location_type",
            getattr(self.instance, "location_type", LocationType.ONLINE),
        )
        if location_type == LocationType.ONLINE:
            link = attrs.get(
                "location_text", getattr(self.instance, "location_text", "")
            )
            if not (link or "").strip():
                raise serializers.ValidationError(
                    {"location_text": "Add the online meeting link."}
                )
        else:
            venue = attrs.get(
                "venue_name", getattr(self.instance, "venue_name", "")
            )
            address = attrs.get(
                "full_address", getattr(self.instance, "full_address", "")
            )
            errors = {}
            if not (venue or "").strip():
                errors["venue_name"] = "Add the venue name."
            if not (address or "").strip():
                errors["full_address"] = "Add the full address."
            if errors:
                raise serializers.ValidationError(errors)
        return attrs
