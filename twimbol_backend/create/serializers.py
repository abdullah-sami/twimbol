from rest_framework import serializers
from user.models import CreatorApplication
from user.serializers import UserProfileSerializer, UserSerializer
from .models import *






class CreatorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreatorApplication
        fields = ['id', 'user', 'application_status', 'created_at']





class ReelCloudinarySerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    class Meta:
        model = ReelCloudinary
        fields = ['post', 'video_url', 'title', 'reel_description', 'thumbnail_url','created_by', 'created_at', 'user_profile']
    
    def get_user_profile(self, obj):
        return UserProfileSerializer(obj.post.created_by.profile).data
    




class VideoCloudinarySerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    class Meta:
        model = VideoCloudinary
        fields = ['post', 'video_url', 'title', 'video_description', 'thumbnail_url','created_by', 'created_at', 'user_profile']
    
    def get_user_profile(self, obj):
        return UserProfileSerializer(obj.post.created_by.profile).data
    
