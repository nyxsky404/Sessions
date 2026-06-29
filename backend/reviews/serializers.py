from rest_framework import serializers

from .models import Review


class ReviewAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    display_name = serializers.CharField()
    avatar = serializers.ImageField()


class ReviewSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "author", "rating", "comment", "is_featured", "created_at"]
