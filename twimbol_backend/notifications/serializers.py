from rest_framework import serializers
from .models import *




class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = notifications
        fields = '__all__'
    

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPrfeference
        fields = '__all__'