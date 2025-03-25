from django.shortcuts import render
from django.shortcuts import redirect
from .forms import *
from app.models import *
from app.utils.youtube_api import get_video_data
# Create your views here.


def dashboard(request):
    context={
        "create_action": "dashboard",
    }

    return render(request, 'create.html', context)




def post(request):
    form = PostForm()

    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = PostForm()

    context={
        "create_action": "post",
        "form": form
    }

    return render(request, 'create.html', context)



def video(request):
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


    context={
        "create_action": "video",
        "form": form
    }

    return render(request, 'create.html', context)

    


def reel(request):
    if request.method == 'POST':
        form = Youtube_Reel_Id_Form(request.POST)

        if form.is_valid():
            form.save()   

            
            latest_reel = Youtube_Reels_Id.objects.latest('id')
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

    context={
            "create_action": "reel",
            "form": form
        }

    return render(request, 'create.html', context)



def manage_contents(request):
    
    return render(request, 'create.html', context={"create_action": "manage-contents"})

def settings(request):
    
    return render(request, 'create.html', context={"create_action": "settings"})




