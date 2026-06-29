from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sessions_app", "0003_session_age_restriction_session_agenda_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="session",
            name="image_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
