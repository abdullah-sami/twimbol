from django.db import models
from app.models import Post
from django.contrib.auth.models import User

# Create your models here.

class ReelCloudinary(models.Model):
    title = models.CharField(max_length=255, blank=True)
    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    post = models.OneToOneField(
        Post, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='reels'
    )


    reel_description = models.TextField(blank=True, null=True)
    thumbnail_url = models.URLField(null=True)
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        User,
        related_name='reel_by',
        on_delete=models.CASCADE

    )


    def __str__(self):
        return self.title or f"Video {self.id}"
    





class VideoCloudinary(models.Model):
    title = models.CharField(max_length=255, blank=True)
    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    post = models.OneToOneField(
        Post, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='videos'
    )


    video_description = models.TextField(blank=True, null=True)
    thumbnail_url = models.URLField(null=True)
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        User,
        related_name='video_by',
        on_delete=models.CASCADE

    )


    def __str__(self):
        return self.title or f"Video {self.id}"
    