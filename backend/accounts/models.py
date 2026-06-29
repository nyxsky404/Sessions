from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    USER = "user", "User"
    CREATOR = "creator", "Creator"


class User(AbstractUser):
    """
    Custom user. Authentication is GitHub-OAuth only (no password login).
    Every account starts as `user` and can switch to `creator` and back;
    only one role is active at a time.
    """

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role = models.CharField(
        max_length=10, choices=Role.choices, default=Role.USER
    )
    github_id = models.BigIntegerField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.username or self.email

    @property
    def display_name(self):
        return self.full_name or self.username
