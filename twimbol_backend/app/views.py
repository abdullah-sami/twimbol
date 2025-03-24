from django.shortcuts import render, redirect
from django.http import HttpResponse
from .utils.youtube_api import get_video_data
from .models import *
from .forms import *
import re

def home(request):


    posts = Post.objects.all().order_by('-id')

    context = { 
        "posts": posts,
        "reel_range": 5

    }

    return render(request, 'home.html', context)
    
    




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






def create(request, create_action):

    form = None

    if create_action == 'video':
    
        if request.method == 'POST':
            form = Youtube_Video_Id_Title_Form(request.POST)
            if form.is_valid():
                form.save()   
            

                latest_video = Youtube_Video_Id_Title.objects.latest('id')
                video_data = get_video_data(latest_video.video_id)

                if video_data:
                    Post.objects.create(post_type='youtube_video', post_title=video_data['title'])
                    Youtube_Video_Data.objects.create(
                        post=Post.objects.latest('id'),
                        video_id=video_data['video_id'],
                        video_title=video_data['title'],
                        thumbnail_url=video_data['thumbnail_url'],
                        channel_title=video_data['channel_title'],
                        channel_image_url=video_data['channel_image_url'],
                        view_count=video_data['view_count'],
                        like_count=video_data['like_count']
                    )



        
                return redirect('home')  
        else:
            form = Youtube_Video_Id_Title_Form() 

    elif create_action == 'reel':

        if request.method == 'POST':
            form = Youtube_Reel_Id_Form(request.POST)

            if form.is_valid():
                form.save()   

                
                latest_reel = Youtube_Reels_Id.objects.latest('id')
                print(latest_reel)
                reel_data = get_video_data(latest_reel.reel_id)


                if reel_data:
                    Post.objects.create(post_type='youtube_reel', post_title=reel_data['title'], )
                    Youtube_Reels_Data.objects.create(
                        post=Post.objects.latest('id'),
                        reel_id=reel_data['video_id'],
                        reel_title=reel_data['title'],
                        thumbnail_url=reel_data['thumbnail_url'],
                        channel_title=reel_data['channel_title'],
                        channel_image_url=reel_data['channel_image_url'],
                        view_count=reel_data['view_count'],
                        like_count=reel_data['like_count']
                    )
            
                return redirect('home')

        else:
            form = Youtube_Reel_Id_Form()


    elif create_action == 'post':
        pass



    
    
    context = {
        "create_action": create_action

    }

    if form:
        context['form'] = form


    




    



    return render(request, 'create.html', context)








def events(request):
    return render(request, 'events.html')


def messages(request):
    return render(request, 'messages.html')