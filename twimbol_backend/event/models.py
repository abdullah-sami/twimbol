from django.db import models
from django.contrib.auth.models import User
from app.models import Post
# Create your models here.
 
class Event(models.Model):
    event_title = models.CharField(max_length=100)
    event_date = models.DateTimeField()
    event_description = models.TextField(null=True, blank=True)

    event_type = models.CharField(max_length=50, choices=[
        ('reel_challenge', 'Reel Challenge'),
        # ('photography_competition', 'Photography Competition'),
        ('video_challenge', 'Video Challenge'),
        # ('ceremony', 'Cermony'),
        ('other', 'Other')
    ])

    event_banner = models.ImageField(upload_to='img/event_banners/', null=True, blank=True, default='img/event_banners/default_event_banner.jpg')

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_created')

    participants = models.ManyToManyField(User, related_name='event_participated', blank=True)

    posts = models.ManyToManyField(Post, related_name='event_post', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.event_title