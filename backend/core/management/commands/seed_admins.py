from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import CustomerProfile

class Command(BaseCommand):
    help = 'Seeds Dhanveer and Jaimin as admin users and sets up their customer profiles'

    def handle(self, *args, **options):
        admins_data = [
            {
                'username': '9313276505',
                'first_name': 'Dhanveer',
                'last_name': '',
                'password': 'Dhanveer@Led123'
            },
            {
                'username': '9081247935',
                'first_name': 'Jaimin',
                'last_name': 'Ramani',
                'password': 'Jaimin@Led123'
            }
        ]

        for admin_info in admins_data:
            user, created = User.objects.get_or_create(
                username=admin_info['username'],
                defaults={
                    'first_name': admin_info['first_name'],
                    'last_name': admin_info['last_name'],
                    'is_staff': True,
                    'is_superuser': True
                }
            )

            if created:
                user.set_password(admin_info['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_info['first_name']} ({admin_info['username']})"))
            else:
                # Ensure they remain superusers
                user.is_staff = True
                user.is_superuser = True
                user.first_name = admin_info['first_name']
                user.last_name = admin_info['last_name']
                user.save()
                self.stdout.write(self.style.WARNING(f"Admin user already exists: {admin_info['first_name']} ({admin_info['username']})"))

            # Create profiles for them as well
            CustomerProfile.objects.update_or_create(
                phone_number=admin_info['username'],
                defaults={
                    'user': user,
                    'name': f"{admin_info['first_name']} {admin_info['last_name']}".strip()
                }
            )

        self.stdout.write(self.style.SUCCESS("Admin seeding completed successfully!"))
