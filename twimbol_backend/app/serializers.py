from rest_framework import serializers
from .models import *
from user.serializers import UserProfileSerializer, UserSerializer
from create.models import *
from create.serializers import *







class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()
    user_profile = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    hidden_by_user = serializers.SerializerMethodField()
    reported_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'post_type',
            'post_title',
            'post_description',
            'created_at',
            'like_count',
            'post_banner',
            'created_by',
            'user_profile',
            'username',
            'comments',
            'liked_by_user',
            'hidden_by_user',
            'reported_by_user',
        ]

   
    def get_like_count(self, obj):
        return Post_Stat_like.objects.filter(post=obj).count()
   
    
    def get_comments(self, obj):
        comments = Post_Comment.objects.filter(post=obj).values('comment')
        return comments


    def get_user_profile(self, obj):
        if hasattr(obj.created_by, 'profile'):
            context = {'request': self.context.get('request')} if self.context else {}
            return UserProfileSerializer(obj.created_by.profile, context=context).data
        return None
   
    def get_username(self, obj):
        return UserSerializer(obj.created_by).data

    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Post_Stat_like.objects.filter(post_id=obj.id, created_by=user).exists()
        return False
    
    def get_hidden_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Post_Stat_hide.objects.filter(post_id=obj.id, created_by=user).exists()
        return False

    def get_reported_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Post_Stat_report.objects.filter(post_id=obj.id, created_by=user).exists()
        return False







class PostSearchSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()  # or use a nested serializer if needed
    trending_score = serializers.IntegerField()
    priority = serializers.IntegerField()
    reels_data = serializers.SerializerMethodField()
    user_profile = serializers.SerializerMethodField() 
    username = serializers.SerializerMethodField() 

    class Meta:
        model = Post
        fields = ['id', 'post_title', 'post_type', 'post_description', 'post_banner', 'created_by', 'created_at', 'priority', 'trending_score', 'reels_data',  'user_profile', 'username']
    
    def get_reels_data(self, obj):
        if obj.post_type == 'reel' and hasattr(obj, 'reels'):
            return ReelCloudinarySerializer(
                obj.reels,
                context=self.context  
            ).data
        return None

    
    # def get_video_data(self, obj):
    #     if obj.post_type == 'youtube_video_upload' and hasattr(obj, 'video_data'):
    #         return VideoCloudinarySerializer(obj.video_data).data
    #     return None
    
   
    # def get_video_data(self, obj):
    #     if obj.post_type == 'youtube_video_upload' and hasattr(obj, 'video_data'):
    #         return YoutubeVideoDataSerializer(obj.video_data).data
    #     return None
   


    def get_user_profile(self, obj):
        if hasattr(obj.created_by, 'profile'):
            return UserProfileSerializer(obj.created_by.profile).data
        return None
   
    def get_username(self, obj):
        return UserSerializer(obj.created_by).data
       








class YoutubeReelsDataSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    class Meta:
        model = Youtube_Reels_Data
        fields = ['post', 'reel_id', 'reel_title', 'reel_description', 'thumbnail_url', 'created_at', 'user_profile']
    
    def get_user_profile(self, obj):
        return UserProfileSerializer(obj.post.created_by.profile).data
    
        fields = ['post', 'reel_id', 'reel_title', 'reel_description', 'thumbnail_url', 'created_at', 'user_profile', 'username']
   
    def get_user_profile(self, obj):
        if hasattr(obj.post.created_by, 'profile'):
            return UserProfileSerializer(obj.post.created_by.profile).data
        return None
   
    def get_username(self, obj):
        return UserSerializer(obj.post.created_by).data
       
   


       


class PostCommentSerializer(serializers.ModelSerializer):
    # post = PostSerializer(read_only=True)
    post = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    def get_created_by(self, obj):
        return UserProfileSerializer(obj.created_by.profile).data
    def get_post(self, obj):
        return obj.post.id

    class Meta:
        model = Post_Comment
        fields = [
            'id',
            'post',
            'comment',
            'created_by',
            'created_at',
        ]




class PostStatLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Stat_like
        fields = '__all__'
        read_only_fields = ('post', 'created_by', 'created_at')



class PostStatHideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Stat_hide
        fields = '__all__'
        read_only_fields = ('post', 'created_by', 'created_at')


class PostStatReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Stat_report
        fields = '__all__'
        read_only_fields = ('post', 'created_by', 'created_at')







class YoutubeVideoIdTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Youtube_Video_Id_Title
        fields = '__all__'




class YoutubeVideoDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Youtube_Video_Data
        fields = '__all__'




class YoutubeReelsIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Youtube_Reels_Id
        fields = '__all__'

