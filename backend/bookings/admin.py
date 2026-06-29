from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("user", "session", "status", "amount_paid", "created_at")
    list_filter = ("status",)
    search_fields = ("user__username", "session__title")
