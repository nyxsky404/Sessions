from django.contrib import admin

from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "category", "price", "start_time", "capacity")
    list_filter = ("category", "location_type")
    search_fields = ("title", "description")
