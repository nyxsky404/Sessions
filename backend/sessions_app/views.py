from django.db.models import Avg, Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from common.permissions import IsCreator, IsOwnerOrReadOnly
from common.uploads import image_upload_error

from .models import Category, HEADER_CATEGORIES, Session


# Aggregates that back the catalog cards, computed in one query per page instead
# of a handful of property lookups per row (avoids N+1). `distinct=True` keeps
# the two relation joins from inflating each other's counts.
CARD_ANNOTATIONS = {
    "active_bookings": Count(
        "bookings", filter=~Q(bookings__status="cancelled"), distinct=True
    ),
    "annotated_avg_rating": Avg("reviews__rating"),
    "annotated_review_count": Count("reviews", distinct=True),
}
from .serializers import (
    SessionDetailSerializer,
    SessionSerializer,
    SessionWriteSerializer,
)


class SessionViewSet(viewsets.ModelViewSet):
    """
    Public catalog (list/retrieve). Create/update/delete require the
    creator role and ownership.
    """

    queryset = Session.objects.select_related("creator").all()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SessionWriteSerializer
        if self.action == "retrieve":
            return SessionDetailSerializer
        return SessionSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "upload_image"):
            return [IsCreator(), IsOwnerOrReadOnly()]
        return [IsAuthenticatedOrReadOnly()]

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "session_create"
            return [ScopedRateThrottle()]
        if self.action == "upload_image":
            self.throttle_scope = "upload"
            return [ScopedRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        if self.action == "list":
            qs = qs.annotate(**CARD_ANNOTATIONS)
            category = params.get("category")
            search = params.get("search")
            if category == Category.OTHER:
                # "Other" is a catch-all: every category without its own chip.
                qs = qs.exclude(category__in=HEADER_CATEGORIES)
            elif category:
                qs = qs.filter(category=category)
            if search:
                qs = qs.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )
            if params.get("upcoming") != "false":
                from django.utils import timezone

                qs = qs.filter(start_time__gte=timezone.now())

            sort = params.get("sort")
            sort_map = {
                "soonest": ["start_time"],
                "newest": ["-created_at"],
                "price_low": ["price", "start_time"],
                "price_high": ["-price", "start_time"],
            }
            if sort in sort_map:
                qs = qs.order_by(*sort_map[sort])
        return qs

    def create(self, request, *args, **kwargs):
        write = self.get_serializer(data=request.data)
        write.is_valid(raise_exception=True)
        instance = write.save(creator=request.user)
        out = SessionSerializer(instance, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        write = self.get_serializer(instance, data=request.data, partial=partial)
        write.is_valid(raise_exception=True)
        write.save()
        out = SessionSerializer(instance, context={"request": request})
        return Response(out.data)

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
        url_path="image",
    )
    def upload_image(self, request, pk=None):
        session = self.get_object()
        file = request.FILES.get("image")
        error = image_upload_error(file)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)
        session.image = file
        session.save(update_fields=["image"])
        return Response(SessionSerializer(session, context={"request": request}).data)


class CreatorSessionsView(viewsets.ViewSet):
    """Creator dashboard: own sessions + booking overview."""

    permission_classes = [IsCreator]

    def list(self, request):
        sessions = (
            Session.objects.filter(creator=request.user)
            .annotate(**CARD_ANNOTATIONS)
            .order_by("start_time")
        )
        return Response(
            SessionSerializer(sessions, many=True, context={"request": request}).data
        )
