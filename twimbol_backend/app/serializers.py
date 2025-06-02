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
<<<<<<< HEAD
            'created_at',
=======
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
            'user_profile',
            'username',
            'comments',
        ]




   
    def get_like_count(self, obj):
        return Post_Stat_like.objects.filter(post=obj).count()
<<<<<<< HEAD
   
=======
    
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
    def get_comments(self, obj):
        comments = Post_Comment.objects.filter(post=obj).values('comment')
        return comments

<<<<<<< HEAD

=======
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
    def get_user_profile(self, obj):
        if hasattr(obj.created_by, 'profile'):
            return UserProfileSerializer(obj.created_by.profile).data
        return None
<<<<<<< HEAD
   
    def get_username(self, obj):
        return UserSerializer(obj.created_by).data





=======
    
    def get_username(self, obj):
        return UserSerializer(obj.created_by).data
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a





class PostSearchSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()  # or use a nested serializer if needed
    trending_score = serializers.IntegerField()
    priority = serializers.IntegerField()
    reels_data = serializers.SerializerMethodField()
<<<<<<< HEAD
    # video_data = serializers.SerializerMethodField()
    user_profile = serializers.SerializerMethodField() 
    username = serializers.SerializerMethodField() 

    class Meta:
        model = Post
        fields = ['id', 'post_title', 'post_type', 'post_description', 'post_banner', 'created_by', 'created_at', 'priority', 'trending_score', 'reels_data',  'user_profile', 'username']
    
    
=======
    video_data = serializers.SerializerMethodField()
    user_profile = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()


    class Meta:
        model = Post
        fields = ['id', 'post_title', 'post_type', 'post_description', 'post_banner', 'created_by', 'created_at', 'priority', 'trending_score', 'reels_data',  'video_data', 'user_profile', 'username']
   
   
>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e
    def get_reels_data(self, obj):
        if obj.post_type == 'reel' and hasattr(obj, 'reels'):
            return ReelCloudinarySerializer(obj.reels).data
        return None
<<<<<<< HEAD
    
    # def get_video_data(self, obj):
    #     if obj.post_type == 'youtube_video_upload' and hasattr(obj, 'video_data'):
    #         return VideoCloudinarySerializer(obj.video_data).data
    #     return None
    
=======
   
    def get_video_data(self, obj):
        if obj.post_type == 'youtube_video_upload' and hasattr(obj, 'video_data'):
            return YoutubeVideoDataSerializer(obj.video_data).data
        return None
   

>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e

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
<<<<<<< HEAD
        fields = ['post', 'reel_id', 'reel_title', 'reel_description', 'thumbnail_url', 'created_at', 'user_profile']
    
    def get_user_profile(self, obj):
        return UserProfileSerializer(obj.post.created_by.profile).data
    
=======
        fields = ['post', 'reel_id', 'reel_title', 'reel_description', 'thumbnail_url', 'created_at', 'user_profile', 'username']
   
    def get_user_profile(self, obj):
        if hasattr(obj.post.created_by, 'profile'):
            return UserProfileSerializer(obj.post.created_by.profile).data
        return None
   
    def get_username(self, obj):
        return UserSerializer(obj.post.created_by).data
       
   


       

>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e



class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Comment
        fields = [
            'post',
            'comment',
        ]






class PostStatLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Stat_like
        fields = [
            'post',
        ]








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














<<<<<<< HEAD
        
=======


       

 
>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e
