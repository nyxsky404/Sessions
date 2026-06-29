from rest_framework import serializers

from .models import Role, User


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "avatar",
            "role",
            "bio",
            "years_experience",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "username", "email", "role", "is_verified", "date_joined"]


class RoleSwitchSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=Role.choices)
