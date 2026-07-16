from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db.models import Sum, Q
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomerProfile, Order, Inquiry, GalleryItem
from .serializers import (
    CustomerProfileSerializer, OrderSerializer, InquirySerializer,
    GalleryItemSerializer, CustomerRegistrationSerializer
)

# Custom JWT Login View to return User metadata (is_staff)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'username': user.username,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'is_staff': user.is_staff
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Customer Registration View
class CustomerRegisterView(generics.CreateAPIView):
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [AllowAny]

# Customer Dashboard - Get their own orders
class CustomerOrdersListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Customers can only see orders matching their phone number (their username)
        phone = self.request.user.username
        return Order.objects.filter(customer_phone=phone).order_by('-event_date')

# Public Submit Inquiry View
class SubmitInquiryView(generics.CreateAPIView):
    serializer_class = InquirySerializer
    permission_classes = [AllowAny]

# Public Gallery List View
class PublicGalleryListView(generics.ListAPIView):
    serializer_class = GalleryItemSerializer
    permission_classes = [AllowAny]
    queryset = GalleryItem.objects.all().order_by('-uploaded_at')

# --- ADMIN ENDPOINTS ---

# Helper permission to check if user is admin/staff
class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

# Admin Order Management ViewSet
class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    queryset = Order.objects.all().order_by('-event_date')

    def get_queryset(self):
        queryset = Order.objects.all().order_by('-event_date')
        
        # Searching/Filtering by phone, name or status
        search_query = self.request.query_params.get('search', None)
        payment_status = self.request.query_params.get('payment_status', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(customer_name__icontains=search_query) |
                Q(customer_phone__icontains=search_query) |
                Q(event_type__icontains=search_query)
            )
        
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
            
        return queryset

# Admin Customer Lookup (Autocompletion helper)
class AdminCustomerLookupView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get(self, request):
        phone = request.query_params.get('phone', '').strip()
        if not phone:
            return Response({'error': 'Phone parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Try finding in profiles first
        profile = CustomerProfile.objects.filter(phone_number=phone).first()
        if profile:
            return Response({
                'found': True,
                'name': profile.name,
                'email': profile.email
            })
            
        # Try finding in historical orders
        last_order = Order.objects.filter(customer_phone=phone).order_by('-created_at').first()
        if last_order:
            return Response({
                'found': True,
                'name': last_order.customer_name,
                'email': ''
            })
            
        return Response({'found': False})

# Admin Inquiry ViewSet (List, Update status)
class AdminInquiryViewSet(viewsets.ModelViewSet):
    serializer_class = InquirySerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    queryset = Inquiry.objects.all().order_by('-created_at')

# Admin Gallery ViewSet (Add, Delete)
class AdminGalleryViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]
    queryset = GalleryItem.objects.all().order_by('-uploaded_at')

# Admin Dashboard Statistics
class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get(self, request):
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(sum=Sum('payment_amount'))['sum'] or 0
        total_received = Order.objects.aggregate(sum=Sum('payment_received'))['sum'] or 0
        total_pending = total_revenue - total_received

        pending_inquiries = Inquiry.objects.filter(status='Pending').count()
        recent_orders_count = Order.objects.filter(payment_status='Unpaid').count()

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_received': total_received,
            'total_pending': total_pending,
            'pending_inquiries': pending_inquiries,
            'unpaid_orders_count': recent_orders_count,
        })
