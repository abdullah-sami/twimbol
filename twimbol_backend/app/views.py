from django.shortcuts import render, redirect
from django.http import HttpResponse
from .utils.youtube_api import get_video_data
from .models import *
from .forms import *


def home(request):


    posts = Post.objects.all().order_by('-id')
    reels = Youtube_Reels_Data.objects.all().order_by('-created_at')
    
    context = { 
        "posts": posts,
        "reels": reels,
        "reel_range": 5

    }

    return render(request, 'home.html', context)
    
    

def post(request, post_id):
    
    post = Post.objects.get(id=post_id)

    context = {
        'post': post
    }

    return render(request, 'post.html', context)




def videos(request):

    posts = Post.objects.all().order_by('-id')

    context = { 
        "posts": posts

    }

    return render(request, 'videos.html', context)


def video(request, video_id):

    video = Youtube_Video_Data.objects.get(video_id=video_id)
    post = Post.objects.get(video_data__video_id=video_id)

    context = {
        "video": video,
        "post": post
    }

    print(post.post_type)

    return render(request, 'video.html', context)    




def reel(request, reel_id):
    first_reel = Youtube_Reels_Data.objects.get(reel_id=reel_id)
    post = Post.objects.get(reels_data__reel_id=reel_id)

    reels = Youtube_Reels_Data.objects.all().order_by('-created_at')

    context = {
        "first_reel": first_reel,
        "post": post,
        "reels": reels,
        "reel_view": first_reel.view_count,
        "reel_like": first_reel.like_count
    }


    return render(request, 'video.html', context)








def events(request):
    return render(request, 'events.html')


def messages(request):
    return render(request, 'messages.html')