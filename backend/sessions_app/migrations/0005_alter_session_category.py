from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("sessions_app", "0004_session_image_url"),
    ]

    operations = [
        migrations.AlterField(
            model_name="session",
            name="category",
            field=models.CharField(
                choices=[
                    ("workshop", "Workshop"),
                    ("mentoring", "Mentoring"),
                    ("fitness", "Fitness"),
                    ("photography", "Photography"),
                    ("cooking", "Cooking"),
                    ("consultation", "Consultation"),
                    ("programming", "Programming"),
                    ("design", "Design"),
                    ("business", "Business"),
                    ("marketing", "Marketing"),
                    ("finance", "Finance"),
                    ("career", "Career"),
                    ("language_learning", "Language Learning"),
                    ("music", "Music"),
                    ("art_crafts", "Art & Crafts"),
                    ("health_wellness", "Health & Wellness"),
                    ("gaming", "Gaming"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=20,
            ),
        ),
    ]
