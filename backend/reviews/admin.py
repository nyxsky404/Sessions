from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "author", "rating", "is_featured", "created_at")
    list_filter = ("rating", "is_featured")
