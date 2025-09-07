# models.py
from django.db import models
from django.contrib.auth.models import User

class ParentAccount(models.Model):
    child = models.OneToOneField(User, on_delete=models.CASCADE, related_name="parent_account")
    parent_email = models.EmailField(unique=True)
    otp_code = models.CharField(max_length=6, blank=True, null=True)  # temporary storage
    otp_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Parent for {self.child.username} - {self.parent_email}"
