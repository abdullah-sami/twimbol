from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    profile_pic = models.ImageField(upload_to='img/profile_pics/', default='img/profile_pics/default.jpg', blank=True)

    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    user_phone = models.CharField(max_length=50, null=True, blank=True)
    user_address = models.CharField(max_length=50, null=True, blank=True)
    user_type = models.CharField(max_length=50, default='regular')
    birthday = models.DateField(null=True, blank=True, default='2000-01-01')

    user_social_fb = models.CharField(max_length=50, null=True, blank=True)
    user_social_twt = models.CharField(max_length=50, null=True, blank=True)
    user_social_yt = models.CharField(max_length=50, null=True, blank=True)

    user_status = models.BooleanField(default=True)
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
    





class Follower(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.follower.username + ' follows ' + self.following.username
    



class Block(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocker')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.blocker.username + ' blocked ' + self.blocked.username









class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  # 6-digit reset code
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.code}"