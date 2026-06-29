"""Shared validation for user-uploaded images (avatars, session covers)."""

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def image_upload_error(file):
    """Return a human-readable error string if `file` is not a valid image
    upload, otherwise None."""
    if not file:
        return "No file provided."
    if file.size > MAX_IMAGE_BYTES:
        return "Image must be under 5 MB."
    if not file.content_type.startswith("image/"):
        return "File must be an image."
    return None
