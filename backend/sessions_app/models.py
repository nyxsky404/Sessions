from django.conf import settings
from django.db import models


class Category(models.TextChoices):
    WORKSHOP = "workshop", "Workshop"
    MENTORING = "mentoring", "Mentoring"
    FITNESS = "fitness", "Fitness"
    PHOTOGRAPHY = "photography", "Photography"
    COOKING = "cooking", "Cooking"
    CONSULTATION = "consultation", "Consultation"
    OTHER = "other", "Other"


# Categories that get their own filter chip on the catalog. Any session whose
# category is not in this set is grouped under the "Other" filter.
HEADER_CATEGORIES = [
    Category.WORKSHOP,
    Category.MENTORING,
    Category.FITNESS,
    Category.PHOTOGRAPHY,
    Category.COOKING,
    Category.CONSULTATION,
]


class LocationType(models.TextChoices):
    ONLINE = "online", "Online"
    IN_PERSON = "in_person", "In person"


class Currency(models.TextChoices):
    INR = "INR", "INR"
    USD = "USD", "USD"


class SkillLevel(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"


class AgeRestriction(models.TextChoices):
    ALL_AGES = "all_ages", "All ages"
    THIRTEEN = "13+", "13+"
    SIXTEEN = "16+", "16+"
    EIGHTEEN = "18+", "18+"
    TWENTY_ONE = "21+", "21+"


class CancellationPolicy(models.TextChoices):
    FLEXIBLE = "flexible", "Flexible"
    MODERATE = "moderate", "Moderate"
    STRICT = "strict", "Strict"


class Session(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    image = models.ImageField(upload_to="sessions/", blank=True, null=True)
    # External cover image (e.g. Unsplash) used by seed data; an uploaded
    # `image` always takes precedence when present.
    image_url = models.URLField(max_length=500, blank=True)
    price = models.PositiveIntegerField(default=0)
    currency = models.CharField(
        max_length=3, choices=Currency.choices, default=Currency.INR
    )
    start_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    capacity = models.PositiveIntegerField(default=1)
    location_type = models.CharField(
        max_length=10, choices=LocationType.choices, default=LocationType.ONLINE
    )
    location_text = models.CharField(max_length=255, blank=True)  # online meeting link
    venue_name = models.CharField(max_length=200, blank=True)  # in-person
    full_address = models.CharField(max_length=300, blank=True)  # in-person

    # Rich detail fields (Fiverr-gig style).
    skill_level = models.CharField(
        max_length=15, choices=SkillLevel.choices, default=SkillLevel.BEGINNER
    )
    language = models.CharField(max_length=50, default="English")
    age_restriction = models.CharField(
        max_length=10, choices=AgeRestriction.choices, default=AgeRestriction.ALL_AGES
    )
    cancellation_policy = models.CharField(
        max_length=10,
        choices=CancellationPolicy.choices,
        default=CancellationPolicy.FLEXIBLE,
    )
    what_you_will_learn = models.JSONField(default=list, blank=True)
    agenda = models.JSONField(default=list, blank=True)
    whats_included = models.JSONField(default=list, blank=True)
    what_to_bring = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)  # list[{question, answer}]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.title} ({self.start_time:%Y-%m-%d %H:%M})"

    @property
    def is_free(self):
        return self.price == 0

    @property
    def end_time(self):
        from datetime import timedelta

        return self.start_time + timedelta(minutes=self.duration_minutes)

    def active_bookings_count(self):
        return self.bookings.exclude(status="cancelled").count()

    @property
    def seats_remaining(self):
        return max(self.capacity - self.active_bookings_count(), 0)

    @property
    def review_count(self):
        return self.reviews.count()

    @property
    def avg_rating(self):
        from django.db.models import Avg

        result = self.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(result, 1) if result is not None else None
