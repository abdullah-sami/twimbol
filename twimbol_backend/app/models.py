from django.db import models
from django.db.models.fields.related import OneToOneField, ForeignKey
from django.contrib.auth.models import User
# Create your models here.






class Post(models.Model):
    post_type = models.CharField(max_length=100)
    post_title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    post_description = models.TextField(null=True)
    post_banner = models.ImageField(upload_to='img/posts/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_created_by')

    

    def __str__(self):
        return self.post_title






class Youtube_Upload(models.Model):
    post = models.OneToOneField(
        Post, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='youtube_upload'
    )
    video_id = models.CharField(max_length=100)
    video_title = models.CharField(max_length=100)
    video_description = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.video_title








class Youtube_Video_Id_Title(models.Model):
    video_id = models.CharField(max_length=100)
    video_title = models.CharField(max_length=100)
    
    
    def __str__(self):
        return self.video_id
    




class Youtube_Video_Data(models.Model):

    post = models.OneToOneField(
        Post, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='video_data'
        # default=1
    )

    video_id = models.CharField(max_length=100)
    video_title = models.CharField(max_length=100)
    video_description = models.TextField()
    thumbnail_url = models.URLField()
    channel_title = models.CharField(max_length=100)
    channel_image_url = models.URLField()
    view_count = models.IntegerField()
    like_count = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.video_id
    




class Youtube_Reels_Id(models.Model):
    reel_id = models.CharField(max_length=100)
    
    
    def __str__(self):
        return self.reel_id

class Youtube_Reels_Data(models.Model):

    post = models.OneToOneField(
        Post, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='reels_data'
    )

    reel_id = models.CharField(max_length=100)
    reel_title = models.CharField(max_length=100)
    reel_description = models.TextField()
    thumbnail_url = models.URLField()
    channel_title = models.CharField(max_length=100)
    channel_image_url = models.URLField()
    view_count = models.IntegerField()
    like_count = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.reel_id