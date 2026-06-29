from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from sessions_app.models import Session

User = get_user_model()


DEMO_CREATORS = [
    {"username": "maya_kapoor", "full_name": "Maya Kapoor", "email": "maya@demo.test"},
    {"username": "arjun_rao", "full_name": "Arjun Rao", "email": "arjun@demo.test"},
    {"username": "leo_martin", "full_name": "Leo Martin", "email": "leo@demo.test"},
]

DEMO_SESSIONS = [
    {
        "title": "Sunrise Vinyasa Flow",
        "description": "Start your day with an energising vinyasa flow suitable for all levels.",
        "category": "fitness",
        "price": 0,
        "currency": "INR",
        "duration_minutes": 60,
        "capacity": 20,
        "location_type": "online",
        "location_text": "Zoom (link after booking)",
    },
    {
        "title": "Portrait Photography Basics",
        "description": "Learn lighting, posing and composition for striking portraits.",
        "category": "photography",
        "price": 1800,
        "currency": "INR",
        "duration_minutes": 90,
        "capacity": 8,
        "location_type": "in_person",
        "location_text": "Studio 21, Bengaluru",
    },
    {
        "title": "1:1 Career Mentoring",
        "description": "A focused session to review your goals and plan next steps.",
        "category": "mentoring",
        "price": 2500,
        "currency": "INR",
        "duration_minutes": 45,
        "capacity": 1,
        "location_type": "online",
        "location_text": "Google Meet (link after booking)",
    },
    {
        "title": "Weekend Pasta Workshop",
        "description": "Hands-on workshop making fresh pasta from scratch.",
        "category": "cooking",
        "price": 1200,
        "currency": "INR",
        "duration_minutes": 120,
        "capacity": 12,
        "location_type": "in_person",
        "location_text": "The Kitchen Loft, Mumbai",
    },
    {
        "title": "Mindfulness & Breathwork",
        "description": "Wind down with guided breathwork and meditation.",
        "category": "workshop",
        "price": 500,
        "currency": "INR",
        "duration_minutes": 45,
        "capacity": 20,
        "location_type": "online",
        "location_text": "Zoom (link after booking)",
    },
]


class Command(BaseCommand):
    help = "Seed demo creators and sessions (idempotent)."

    def handle(self, *args, **options):
        creators = []
        for data in DEMO_CREATORS:
            user, _ = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "full_name": data["full_name"],
                    "email": data["email"],
                    "role": "creator",
                },
            )
            creators.append(user)

        start = timezone.now() + timedelta(days=2)
        for i, data in enumerate(DEMO_SESSIONS):
            creator = creators[i % len(creators)]
            Session.objects.get_or_create(
                title=data["title"],
                creator=creator,
                defaults={
                    **data,
                    "start_time": start + timedelta(days=i, hours=i),
                },
            )

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
