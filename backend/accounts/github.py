"""GitHub OAuth helpers: exchange code -> token -> user profile."""
import requests
from django.conf import settings

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


class GitHubOAuthError(Exception):
    pass


def exchange_code_for_token(code):
    resp = requests.post(
        GITHUB_TOKEN_URL,
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
        },
        timeout=10,
    )
    payload = resp.json()
    token = payload.get("access_token")
    if not token:
        raise GitHubOAuthError(payload.get("error_description", "Token exchange failed"))
    return token


def fetch_github_profile(token):
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    user_resp = requests.get(GITHUB_USER_URL, headers=headers, timeout=10)
    if user_resp.status_code != 200:
        raise GitHubOAuthError("Failed to fetch GitHub profile")
    user = user_resp.json()

    email = user.get("email")
    if not email:
        emails_resp = requests.get(GITHUB_EMAILS_URL, headers=headers, timeout=10)
        if emails_resp.status_code == 200:
            emails = emails_resp.json()
            primary = next(
                (e for e in emails if e.get("primary") and e.get("verified")), None
            )
            email = (primary or (emails[0] if emails else {})).get("email")

    if not email:
        email = f"{user['id']}+{user['login']}@users.noreply.github.com"

    return {
        "github_id": user["id"],
        "username": user["login"],
        "email": email,
        "full_name": user.get("name") or user["login"],
        "avatar_url": user.get("avatar_url", ""),
    }
