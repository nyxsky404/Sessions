from django.urls import path

from .views import AvatarUploadView, MeView, RoleSwitchView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("me/avatar/", AvatarUploadView.as_view(), name="me-avatar"),
    path("me/role/", RoleSwitchView.as_view(), name="me-role"),
]
