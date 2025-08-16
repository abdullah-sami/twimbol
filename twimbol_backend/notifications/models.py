# FIXED MODELS
from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):  # Fixed: PascalCase naming
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    page = models.TextField(blank=True, null=True)
    page_item_id = models.TextField(blank=True, null=True)
    notification_type = models.CharField(max_length=255, blank=True, null=True, default='general')

    def __str__(self):
        return f"Notification for {self.user.username} at {self.created_at}"

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'


class NotificationPreference(models.Model):  # Fixed: Typo corrected
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    all_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    
    # social
    follow_notifications = models.BooleanField(default=True)
    likes_notifications = models.BooleanField(default=True)
    comments_notifications = models.BooleanField(default=False)
    
    # events
    new_events_notifications = models.BooleanField(default=True)
    event_reminders_notifications = models.BooleanField(default=True)

    def __str__(self):
        return f"Notification preferences for {self.user.username}"

    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
