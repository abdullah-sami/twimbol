from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer
from django.shortcuts import get_object_or_404

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        
        try:
            preferences = NotificationPreference.objects.get(user=user)
        except NotificationPreference.DoesNotExist:
            preferences = NotificationPreference.objects.create(user=user)

        queryset = Notification.objects.filter(user=user)
        
        if not preferences.all_notifications:
            return Notification.objects.none()

        excluded_types = []
        if not preferences.follow_notifications:
            excluded_types.append('follow')
        if not preferences.likes_notifications:
            excluded_types.append('like')
        if not preferences.comments_notifications:
            excluded_types.append('comment')
        if not preferences.new_events_notifications:
            excluded_types.append('new_event')
        if not preferences.event_reminders_notifications:
            excluded_types.append('event_reminder')

        if excluded_types:
            queryset = queryset.exclude(notification_type__in=excluded_types)
            
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_as_read(self, request):
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': f'{count} notifications marked as read'})

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='preferences')
    def get_or_update_preferences(self, request):
        """
        Retrieves or updates the user's notification preferences.
        """
        preference, created = NotificationPreference.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = NotificationPreferenceSerializer(preference)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = NotificationPreferenceSerializer(preference, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)