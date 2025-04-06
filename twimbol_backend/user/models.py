from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50, null=True)
    last_name = models.CharField(max_length=50, null=True)
    user_phone = models.CharField(max_length=50, null=True)
    user_address = models.CharField(max_length=50, null=True)
    user_type = models.CharField(max_length=50, default='regular')

    user_social_fb = models.CharField(max_length=50, null=True)
    user_social_twt = models.CharField(max_length=50, null=True)
    user_social_yt = models.CharField(max_length=50, null=True)

    user_status = models.CharField(max_length=50, default=1)
    user_banned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username




class CreatorApplication(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='creator_applicant')
    application_status = models.CharField(max_length=50, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username