from django.urls import path

from .views import CreateCheckoutView, StripeWebhookView

urlpatterns = [
    path("payments/checkout/", CreateCheckoutView.as_view(), name="checkout"),
    path("payments/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
