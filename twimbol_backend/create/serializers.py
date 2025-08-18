from rest_framework import serializers
from user.models import CreatorApplication
from user.serializers import UserProfileSerializer, UserSerializer
from .models import *

from app.models import Post_Stat_like, Post_Comment






class CreatorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreatorApplication
        fields = ['id', 'user', 'application_status', 'created_at']




class ReelCloudinarySerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = ReelCloudinary
        fields = [
            'title',
            'video_url',
            'created_at',
            'post',
            'reel_description',
            'thumbnail_url',
            'view_count',
            'like_count',
            'comments',
            'created_by',
            'user_profile',
            'liked_by_user',
        ]
    
    def get_user_profile(self, obj):
        if hasattr(obj.created_by, 'profile'):
            context = {'request': self.context.get('request')} if self.context else {}
            return UserProfileSerializer(obj.created_by.profile, context=context).data
        return None
    
    def get_like_count(self, obj):
        return Post_Stat_like.objects.filter(post=obj.post).count()

    def get_comments(self, obj):
        comments = Post_Comment.objects.filter(post=obj.post).count()
        return comments

    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Post_Stat_like.objects.filter(post=obj.post, created_by=user).exists()
        return False

    




class VideoCloudinarySerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    class Meta:
        model = VideoCloudinary
        fields = ['post', 'video_url', 'title', 'video_description', 'thumbnail_url','created_by', 'created_at', 'user_profile']
    
    def get_user_profile(self, obj):
        return UserProfileSerializer(obj.post.created_by.profile).data
    
