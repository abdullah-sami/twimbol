from django.shortcuts import render, redirect
from django.http import HttpResponse
from .utils.youtube_api import get_video_data, get_video_stats
from .models import *
from .forms import *


def home(request):
    
    
    posts = Post.objects.all().order_by('-id')
    reels = Youtube_Reels_Data.objects.all().order_by('-created_at')
    
    context = { 
        "posts": posts,
        "reels": reels,
        "reel_range": 5,

    }

    return render(request, 'home.html', context)
    
    

def post(request, post_id):
    
    post = Post.objects.get(id=post_id)

    context = {
        'post': post
    }

    return render(request, 'post.html', context)




def videos(request):
    posts = Post.objects.all().order_by('-created_at')
    stats = []  

    for post in posts:
        # Access the related video_data using the related_name
        video_data = getattr(post, 'video_data', None)
        if video_data:
            stats.append(video_data)

        



    for stat in stats:
        x = get_video_stats(stat)
        if x:
            Youtube_Video_Data.objects.filter(video_id=stat.video_id).update(
                view_count=x.get('view_count', 0),
                like_count=x.get('like_count', 0)
            )

    
    

    context = { 
        'posts': posts,

    }

    return render(request, 'videos.html', context)


def video(request, video_id):

    video = Youtube_Video_Data.objects.get(video_id=video_id)
    post = Post.objects.get(video_data__video_id=video_id)

    stats = get_video_data(video_id)

    # Update the video data in the database
    if stats:
        Youtube_Video_Data.objects.filter(video_id=video_id).update(
            view_count=stats.get('view_count', 0),
            like_count=stats.get('like_count', 0)
        )

    context = {
        "video": video,
        "post": post,
        "views": stats.get("view_count", "0"),
        "likes": stats.get("like_count", "0"),
    }

    print(post.post_type)

    return render(request, 'video.html', context)    




def reel(request, reel_id):
    first_reel = Youtube_Reels_Data.objects.get(reel_id=reel_id)
    post = Post.objects.get(reels_data__reel_id=reel_id)

    reels = Youtube_Reels_Data.objects.all().order_by('-created_at')
    
    stats = get_video_data(reel_id)

    context = {
        "first_reel": first_reel,
        "post": post,
        "reels": reels,
        "views": stats.get("view_count", "0"),
        "likes": stats.get("like_count", "0"),
    }


    return render(request, 'video.html', context)








def events(request):
    return render(request, 'events.html')


def messages(request):
    return render(request, 'messages.html')