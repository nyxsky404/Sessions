from django.urls import path

from .auth_views import (
    CookieTokenRefreshView,
    GitHubAuthorizeURLView,
    GitHubLoginView,
    LogoutView,
)

urlpatterns = [
    path("github/url/", GitHubAuthorizeURLView.as_view(), name="github-url"),
    path("github/", GitHubLoginView.as_view(), name="github-login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
