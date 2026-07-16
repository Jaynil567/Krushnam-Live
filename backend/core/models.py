from django.db import models
from django.contrib.auth.models import User

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    phone_number = models.CharField(max_length=15, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone_number})"

class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Partial', 'Partial'),
        ('Unpaid', 'Unpaid'),
    ]

    customer_phone = models.CharField(max_length=15, db_index=True)
    customer_name = models.CharField(max_length=100)
    led_size = models.CharField(max_length=100)  # e.g. "12x8 ft", "16x9 ft"
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    payment_received = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    event_date = models.DateField()
    event_time = models.TimeField(null=True, blank=True)
    event_type = models.CharField(max_length=100)  # Marriage, Live Stream, Mixer, etc.
    description = models.TextField(null=True, blank=True, help_text="Extra details or notes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order for {self.customer_name} on {self.event_date} - Size: {self.led_size}"

class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Contacted', 'Contacted'),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)
    requirements = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.name} ({self.phone})"

class GalleryItem(models.Model):
    title = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='gallery/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Gallery Image {self.id}"
