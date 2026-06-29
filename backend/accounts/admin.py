from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "full_name", "role", "date_joined")
    list_filter = ("role", "is_staff")
    search_fields = ("username", "email", "full_name")
    fieldsets = UserAdmin.fieldsets + (
        ("Marketplace", {"fields": ("full_name", "avatar", "role", "github_id")}),
    )
