from django.urls import path

from .views import BookingViewSet, CreatorSessionBookingsView

booking_list = BookingViewSet.as_view({"get": "list", "post": "create"})
booking_cancel = BookingViewSet.as_view({"post": "cancel"})

urlpatterns = [
    path("bookings/", booking_list, name="booking-list"),
    path("bookings/<int:pk>/cancel/", booking_cancel, name="booking-cancel"),
    path(
        "creator/sessions/<int:session_id>/bookings/",
        CreatorSessionBookingsView.as_view(),
        name="creator-session-bookings",
    ),
]
