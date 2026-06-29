from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CreatorSessionsView, SessionViewSet

router = DefaultRouter()
router.register(r"sessions", SessionViewSet, basename="session")

urlpatterns = [
    path(
        "creator/sessions/",
        CreatorSessionsView.as_view({"get": "list"}),
        name="creator-sessions",
    ),
]
urlpatterns += router.urls
