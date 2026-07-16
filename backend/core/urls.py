from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, CustomerRegisterView, CustomerOrdersListView,
    SubmitInquiryView, PublicGalleryListView, AdminOrderViewSet,
    AdminCustomerLookupView, AdminInquiryViewSet, AdminGalleryViewSet, AdminStatsView
)

router = DefaultRouter()
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'admin/inquiries', AdminInquiryViewSet, basename='admin-inquiries')
router.register(r'admin/gallery', AdminGalleryViewSet, basename='admin-gallery')

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', CustomerRegisterView.as_view(), name='customer_register'),
    
    # Customer endpoints
    path('customer/orders/', CustomerOrdersListView.as_view(), name='customer_orders'),
    
    # Public endpoints
    path('public/inquiry/', SubmitInquiryView.as_view(), name='submit_inquiry'),
    path('public/gallery/', PublicGalleryListView.as_view(), name='public_gallery'),
    
    # Admin custom endpoints
    path('admin/lookup/', AdminCustomerLookupView.as_view(), name='admin_customer_lookup'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]
