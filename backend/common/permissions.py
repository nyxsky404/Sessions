from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsCreator(BasePermission):
    """Allows access only to users whose active role is `creator`."""

    message = "Switch to creator mode to manage sessions."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "creator"
        )


class IsUserRole(BasePermission):
    """Allows access only to users whose active role is `user`."""

    message = "Switch to traveller mode to book sessions."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "user"
        )


class IsOwnerOrReadOnly(BasePermission):
    """Object-level: only the owning creator may modify; reads are open."""

    owner_field = "creator"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return getattr(obj, self.owner_field, None) == request.user
