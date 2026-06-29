from urllib.parse import urlencode

import requests as http_requests
from django.conf import settings
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .github import GitHubOAuthError, exchange_code_for_token, fetch_github_profile
from .models import User
from .serializers import UserSerializer


def _save_github_avatar(user, avatar_url, github_id):
    """Download the GitHub avatar and attach it to the user's avatar field."""
    try:
        resp = http_requests.get(avatar_url, timeout=5)
        if resp.status_code == 200:
            filename = f"github_{github_id}.jpg"
            user.avatar.save(filename, ContentFile(resp.content), save=True)
    except Exception:
        pass


def set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        settings.REFRESH_COOKIE_NAME,
        str(refresh_token),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path="/api/auth/",
    )


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), refresh


GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"


class GitHubAuthorizeURLView(APIView):
    """Build the GitHub authorize URL from runtime settings.

    The client id / redirect uri are resolved at request time so they always
    reflect the backend's environment — unlike Vite `VITE_*` vars, which get
    baked into the static frontend bundle at build time and go stale.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.GITHUB_CLIENT_ID:
            return Response(
                {"detail": "GitHub OAuth is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        query = urlencode(
            {
                "client_id": settings.GITHUB_CLIENT_ID,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
                "scope": "read:user user:email",
            }
        )
        return Response({"url": f"{GITHUB_AUTHORIZE_URL}?{query}"})


class GitHubLoginView(APIView):
    """Exchange a GitHub OAuth `code` for app JWTs."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response(
                {"detail": "Missing `code`."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = exchange_code_for_token(code)
            profile = fetch_github_profile(token)
        except GitHubOAuthError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        user, created = User.objects.update_or_create(
            github_id=profile["github_id"],
            defaults={
                "username": profile["username"],
                "email": profile["email"],
            },
        )
        update_fields = []
        if not user.full_name:
            user.full_name = profile["full_name"]
            update_fields.append("full_name")
        if update_fields:
            user.save(update_fields=update_fields)

        if not user.avatar and profile.get("avatar_url"):
            _save_github_avatar(user, profile["avatar_url"], profile["github_id"])

        access, refresh = tokens_for_user(user)
        response = Response(
            {"access": access, "user": UserSerializer(user, context={"request": request}).data}
        )
        set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(APIView):
    """Issue a new access token using the refresh cookie."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "refresh"

    def post(self, request):
        raw = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not raw:
            return Response(
                {"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            refresh = RefreshToken(raw)
        except TokenError:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access = str(refresh.access_token)
        response = Response({"access": access})
        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
            # Actually rotate: issue a fresh token (new jti + sliding expiry)
            # so the cookie value changes on every refresh.
            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()
            set_refresh_cookie(response, refresh)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/api/auth/")
        return response
