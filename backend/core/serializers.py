from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CustomerProfile, Order, Inquiry, GalleryItem

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['id', 'phone_number', 'name', 'email', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    balance_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer_phone', 'customer_name', 'led_size',
            'payment_amount', 'payment_received', 'payment_status',
            'event_date', 'event_time', 'event_type', 'description',
            'balance_amount', 'created_at'
        ]

    def get_balance_amount(self, obj):
        return obj.payment_amount - obj.payment_received

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'phone', 'email', 'event_date', 'requirements', 'status', 'created_at']

class GalleryItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = ['id', 'title', 'image', 'image_url', 'uploaded_at']
        extra_kwargs = {
            'image': {'write_only': True}
        }

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class CustomerRegistrationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    name = serializers.CharField(max_length=100)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_phone_number(self, value):
        if CustomerProfile.objects.filter(user__username=value).exists() or User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this phone number is already registered.")
        return value

    def create(self, validated_data):
        phone = validated_data['phone_number']
        name = validated_data['name']
        password = validated_data['password']
        email = validated_data.get('email', '')

        # Create Django User with username as phone number
        user = User.objects.create_user(
            username=phone,
            password=password,
            first_name=name,
            email=email
        )

        # Create or update CustomerProfile
        profile, created = CustomerProfile.objects.update_or_create(
            phone_number=phone,
            defaults={
                'user': user,
                'name': name,
                'email': email
            }
        )

        return profile
