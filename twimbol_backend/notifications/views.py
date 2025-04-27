from django.shortcuts import render
from .models import *
from .serializers import *
from rest_framework import viewsets, permissions

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = notifications.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return notifications.objects.filter(user=user).order_by('-created_at')
        else:
            return notifications.objects.none()
