from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification  # Fixed: Updated model reference
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference  # Fixed: Updated model reference
        fields = '__all__'
        read_only_fields = ('user',)

    def validate(self, data):
        if not data.get('all_notifications', True):
            data['email_notifications'] = False
            data['push_notifications'] = False
            data['follow_notifications'] = False
            data['likes_notifications'] = False
            data['comments_notifications'] = False
            data['new_events_notifications'] = False
            data['event_reminders_notifications'] = False
        return data
