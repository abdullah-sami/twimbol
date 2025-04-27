from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class notifications(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    page = models.TextField(blank=True, null=True)
    page_item_id = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Notification for {self.user.username} at {self.created_at}"
    



class NotificationPrfeference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    # email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)


    def __str__(self):
        return f"Notification preferences for {self.user.username}"