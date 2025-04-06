from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .forms import *
from app.models import *
from user.models import CreatorApplication
from app.utils.youtube_api import get_video_data, upload_to_youtube, get_youtube_credentials
from django.contrib.auth.decorators import login_required
from user.decorators import admin_required, creator_required, visitor_required

import tempfile


@login_required
def dashboard(request):
    user = request.user

    if not user.groups.filter(name='admin').exists() and not user.groups.filter(name='creator').exists():
        if CreatorApplication.objects.filter(user=user, application_status=0).exists():
            creator_application_msg = "Already applied for creator"
        
        return render(request, 'create.html', context={"create_action": "Not Allowed", "user": user, "creator_application_message": creator_application_msg if 'creator_application_msg' in locals() else None})

    upload_message = ''

    if request.method == "GET":
        upload_message = request.GET.get("upload_message", "")


    posts = Post.objects.all().filter(created_by=user).order_by("-created_at")

    total_view_count = 0
    total_like_count = 0

    for post in posts:
        if(getattr(post, 'video_data', None)):
            total_view_count += getattr(post, 'video_data', None).view_count
            total_like_count += getattr(post, 'video_data', None).like_count
         
    context={
        "create_action": "dashboard",
        "user": user,
        "upload_message": upload_message,
        "posts": posts,
        "views": total_view_count,
        "likes": total_like_count
    }
    return render(request, 'create.html', context)


@creator_required
def post(request):
    form = PostForm()

    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        
        user = request.user

        form.instance.created_by = user
        
        if form.is_valid():
            form.save()
            return redirect(reverse('dashboard')+'?upload_message=success')
    else:
        form = PostForm()

    context={
        "create_action": "post",
        "form": form,
    }

    return render(request, 'create.html', context)


@creator_required
def post_edit(request, post_id):
    message = ''
    try:
        # Fetch the post by ID
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        # Handle the case where the post does not exist
        return redirect(reverse('dashboard') + '?upload_message=post_not_found')

    user = request.user
    
    if post.created_by == user:
        if request.method == 'POST':
            form = PostForm(request.POST, request.FILES)
    
            form.instance.created_by = user
            
            if form.is_valid():
                Post.objects.filter(id=post_id).update(
                    post_title=form.cleaned_data['post_title'],
                    post_description=form.cleaned_data['post_description'],
                    post_type=form.cleaned_data['post_type'])
                if form.cleaned_data.get('post_banner'):
                    Post.objects.filter(id=post_id).update(
                    post_banner=form.cleaned_data['post_banner'])
                elif post.post_banner :
                    Post.objects.filter(id=post_id).update(
                    post_banner=post.post_banner)
                


                message = "post edited"
                return redirect(reverse('dashboard')+'?upload_message=success')
            
        else:
            form = PostForm(instance=post)
            message = 'edit post'

    else:
        message = "Cannot edit this post"
        form = None

    context={
        "create_action": "post",
        "post": post,
        "form": form,
        "message": message
    }

    return render(request, 'create.html', context)






@creator_required
def video(request):
    return render(request, 'create.html', context={"create_action": "video"})


@creator_required
def video_link(request):
    user = request.user
    if request.method == 'POST':
        form_yt_link = Youtube_Video_Id_Title_Form(request.POST)
        if form_yt_link.is_valid():
            form_yt_link.save()   

            latest_video = Youtube_Video_Id_Title.objects.latest('id')
            video_data = get_video_data(latest_video.video_id)

            if video_data:
                Post.objects.create(post_type='youtube_video', post_title=video_data['title'], created_by=user)
                Youtube_Video_Data.objects.create(
                    post=Post.objects.latest('id'),
                    video_id=video_data['video_id'],
                    video_title=video_data['title'],
                    video_description=video_data['description'],
                    thumbnail_url=video_data['thumbnail_url'],
                    channel_title=video_data['channel_title'],
                    channel_image_url=video_data['channel_image_url'],
                    view_count=video_data['view_count'],
                    like_count=video_data['like_count']
                )


            return redirect(reverse('dashboard')+'?upload_message=success')

        else:
            return redirect(reverse('dashboard')+'?upload_message=failed')


    else:
        form_yt_link = Youtube_Video_Id_Title_Form() 




    context={
        "create_action": "video",
        "form": form_yt_link
    }

    return render(request, 'create.html', context)

    

@creator_required
def video_upload(request):

    user = request.user
    
    
    if request.method == 'POST':
        title = request.POST['title']
        description = request.POST['description']
        video_file = request.FILES['video']

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
            for chunk in video_file.chunks():
                temp.write(chunk)
            video_path = temp.name

        x = upload_to_youtube(video_path, title, description)
        if x:
            video_data = get_video_data(x.get('id'))
            if video_data:
                Post.objects.create(post_type='youtube_video_upload', post_title=video_data['title'], created_by=user)
                Youtube_Video_Data.objects.create(
                    post=Post.objects.latest('id'),
                    video_id=video_data['video_id'],
                    video_title=video_data['title'],
                    video_description=video_data['description'],
                    thumbnail_url=video_data['thumbnail_url'],
                    channel_title=video_data['channel_title'],
                    channel_image_url=video_data['channel_image_url'],
                    view_count=video_data['view_count'],
                    like_count=video_data['like_count']
                )

            return redirect(reverse('dashboard')+'?upload_message=success')

        else:
            return redirect(reverse('dashboard')+'?upload_message=failed')




    context={
        "create_action": "video",
        "user": user,
        "video_upload": True
    }


    return render(request, 'create.html', context)







@creator_required
def reel(request):
    user = request.user
    
    
    if request.method == 'POST':
        title = request.POST['title']
        description = request.POST['description']
        reel_file = request.FILES['video']

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
            for chunk in reel_file.chunks():
                temp.write(chunk)
            video_path = temp.name

        x = upload_to_youtube(video_path, title, description)
        if x:
            video_data = get_video_data(x.get('id'))
            if video_data:
                Post.objects.create(post_type='youtube_reel', post_title=video_data['title'], created_by=user)
                Youtube_Reels_Data.objects.create(
                    post=Post.objects.latest('id'),
                    reel_id=video_data['video_id'],
                    reel_title=video_data['title'],
                    reel_description=video_data['description'],
                    thumbnail_url=video_data['thumbnail_url'],
                    channel_title=video_data['channel_title'],
                    channel_image_url=video_data['channel_image_url'],
                    view_count=video_data['view_count'],
                    like_count=video_data['like_count']
                )

            return redirect(reverse('dashboard')+'?upload_message=success')

        else:
            return redirect(reverse('dashboard')+'?upload_message=failed')




    context={
        "create_action": "reel",
        "user": user,
        "reel_upload": True
    }


    return render(request, 'create.html', context)


    # if request.method == 'POST':
    #     form = Youtube_Reel_Id_Form(request.POST)

    #     if form.is_valid():
    #         form.save()   

            
    #         latest_reel = Youtube_Reels_Id.objects.latest('id')
    #         reel_data = get_video_data(latest_reel.reel_id)


    #         if reel_data:
    #             Post.objects.create(post_type='youtube_reel', post_title=reel_data['title'], created_by=request.user)
    #             Youtube_Reels_Data.objects.create(
    #                 post=Post.objects.latest('id'),
    #                 reel_id=reel_data['video_id'],
    #                 reel_title=reel_data['title'],
    #                 reel_description=reel_data['description'],
    #                 thumbnail_url=reel_data['thumbnail_url'],
    #                 channel_title=reel_data['channel_title'],
    #                 channel_image_url=reel_data['channel_image_url'],
    #                 view_count=reel_data['view_count'],
    #                 like_count=reel_data['like_count']
    #             )
        
    #         return redirect('home')

    # else:
    #     form = Youtube_Reel_Id_Form()

    # context={
    #         "create_action": "reel",
    #         "form": form
    #     }

    # return render(request, 'create.html', context)






@creator_required
def manage_contents(request):
    user = request.user

    upload_message = ''

    if request.method == "GET":
        upload_message = request.GET.get("upload_message", "")


    posts = Post.objects.all().filter(created_by=user).order_by("-created_at")

    total_view_count = 0
    total_like_count = 0

    for post in posts:
        if(getattr(post, 'video_data', None)):
            total_view_count += getattr(post, 'video_data', None).view_count
            total_like_count += getattr(post, 'video_data', None).like_count
         
    context={
        "create_action": "manage-contents",
        "user": user,
        "upload_message": upload_message,
        "posts": posts,
        
    }
    return render(request, 'create.html', context)




@creator_required
def delete_post(request, post_id):

    post = get_object_or_404(Post, id=post_id, created_by=request.user)

    if request.method == 'POST':
        form = PostDeleteForm(request.POST)
        if form.is_valid():
            post.delete()
            return redirect(reverse('manage-contents')+'?upload_message=post_deleted')
    else:
        form = PostDeleteForm()

    return render(request, 'create.html', {'create_action': "delete",'form': form, 'post': post,})









@login_required
def settings(request):
    
    return render(request, 'create.html', context={"create_action": "settings"})




@visitor_required
def apply_for_creator(request):
    user = request.user

    if request.method == 'POST':
        CreatorApplication.objects.create(user=user)
        return redirect(reverse('dashboard')+'?upload_message=creator_application_submitted')
    
    if CreatorApplication.objects.filter(user=user).exists():
        return redirect(reverse('dashboard')+'?upload_message=creator_application_already_submitted')
    



    context={
        "create_action": "apply-for-creator",
    }

    return render(request, 'apply.html', context)