from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.auth_urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("sessions_app.urls")),
    path("api/", include("bookings.urls")),
    path("api/", include("payments.urls")),
]
