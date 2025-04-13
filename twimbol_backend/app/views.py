from django.shortcuts import render, redirect
from django.http import HttpResponse
from .utils.youtube_api import get_video_data, get_video_stats
from django.db.models import Q, Case, When, IntegerField, F
from .models import *
from .forms import *
from django.urls import reverse

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

    user = request.user
    
    post = Post.objects.get(id=post_id)



    # comments
    post_comments = Post_Comment.objects.filter(post=post).order_by('-created_at')
    post_comment_form = CommentForm(request.POST or None)
    if request.method == 'POST' and 'comment_form' in request.POST:
        if post_comment_form.is_valid():
            comment = post_comment_form.save(commit=False)
            comment.post = post
            comment.created_by = user
            comment.save()
            return redirect('post', post_id=post.id)
    if request.POST and 'delete_comment_form' in request.POST:
        comment_id = request.POST.get('comment_id')
        comment = Post_Comment.objects.get(id=comment_id)
        print(comment)
        if comment.created_by == user:
            comment.delete()
            return redirect('post', post_id=post.id)
        
        
    # Likes

    post_stat_like_form = PostStatLikeForm(request.POST or None)
    if request.method == 'POST' and 'created_by' in request.POST:

        # Check if the user has already liked the post  
        if Post_Stat_like.objects.filter(post=post, created_by=user).exists():

            # User has already liked the post, so we can remove the like
            like = Post_Stat_like.objects.get(post=post, created_by=user)
            like.delete()
            return redirect('post', post_id=post.id)
        
        # User has not liked the post yet, so we can add a like
        else:
            print(2)
            if post_stat_like_form.is_valid():
                print(3)
                like = post_stat_like_form.save(commit=False)
                like.post = post
                like.created_by = user
                like.save()
                return redirect('post', post_id=post.id)
            
        
        




    context = {
        'post': post,
        'user': user,
        'post_comments': post_comments,
        'comment_form': post_comment_form,
        'post_stat_like': {
            'post_stat_like_form' : post_stat_like_form,
            'post_stat_likes': Post_Stat_like.objects.filter(post=post).count(),
        }
    }

    return render(request, 'post.html', context)















def videos(request):
    posts = Post.objects.all().order_by('-created_at')






    
    ########## Update video stats in the database ##########
        # stats = []  
        # for post in posts:
        #     # Access the related video_data using the related_name
        #     video_data = getattr(post, 'video_data', None)
        #     if video_data:
        #         stats.append(video_data)
        # for stat in stats:
        #     x = get_video_stats(stat)
        #     if x:
        #         Youtube_Video_Data.objects.filter(video_id=stat.video_id).update(
        #             view_count=x.get('view_count', 0),
        #             like_count=x.get('like_count', 0)
        #         )




    context = { 
        'posts': posts,

    }

    return render(request, 'videos.html', context)






def video(request, video_id):

    user = request.user

    video = Youtube_Video_Data.objects.get(video_id=video_id)
    post = Post.objects.get(video_data__video_id=video_id)

    stats = get_video_data(video_id)

    # Update the video data in the database
    if stats:
        Youtube_Video_Data.objects.filter(video_id=video_id).update(
            view_count=stats.get('view_count', 0),
            like_count=stats.get('like_count', 0)
        )

    # comments
    
    post_comments = Post_Comment.objects.filter(post=post).order_by('-created_at')
    post_comment_form = CommentForm(request.POST or None)

    if request.method == 'POST' and 'comment_form' in request.POST:
        if post_comment_form.is_valid():
            comment = post_comment_form.save(commit=False)
            comment.post = post
            comment.created_by = user
            comment.save()
            return redirect('video', video_id=video_id)


    if request.POST and 'delete_comment_form' in request.POST:
        comment_id = request.POST.get('comment_id')
        comment = Post_Comment.objects.get(id=comment_id)
        print(comment)
        if comment.created_by == user:
            comment.delete()
            return redirect('video', video_id=video_id)
        

        
        
    # Likes

    post_stat_like_form = PostStatLikeForm(request.POST or None)
    if request.method == 'POST' and 'created_by' in request.POST:

        # Check if the user has already liked the post  
        if Post_Stat_like.objects.filter(post=post, created_by=user).exists():

            # User has already liked the post, so we can remove the like
            like = Post_Stat_like.objects.get(post=post, created_by=user)
            like.delete()
            return redirect('video', video_id=video_id)
        
        # User has not liked the post yet, so we can add a like
        else:
            print(2)
            if post_stat_like_form.is_valid():
                print(3)
                like = post_stat_like_form.save(commit=False)
                like.post = post
                like.created_by = user
                like.save()
                return redirect('video', video_id=video_id)
            
        
        

    context = {
        "video": video,
        "post": post,
        "views": stats.get("view_count", "0"),
        "likes": stats.get("like_count", "0"),
        "post_comments": post_comments,
        "comment_form": post_comment_form,
        'post_stat_like': {
            'post_stat_like_form' : post_stat_like_form,
            'post_stat_likes': Post_Stat_like.objects.filter(post=post).count(),}
    }



    return render(request, 'video.html', context)    




def reel(request, reel_id):
    first_reel = Youtube_Reels_Data.objects.get(reel_id=reel_id)
    post = Post.objects.get(reels_data__reel_id=reel_id)

    reels = Youtube_Reels_Data.objects.all().order_by('-created_at')
    posts = Post.objects.filter(reels_data__reel_id=reel_id).order_by('-created_at')

    stats = get_video_data(reel_id)

    user = request.user
    
    
    post_comments = Post_Comment.objects.filter(post=post).order_by('-created_at')
    post_comment_form = CommentForm(request.POST or None)

    if request.method == 'POST' and 'comment_form' in request.POST:
        if post_comment_form.is_valid():
            comment = post_comment_form.save(commit=False)
            comment.post = post
            comment.created_by = user
            comment.save()
            return redirect('reel', reel_id=reel_id)


    if request.POST and 'delete_comment_form' in request.POST:
        comment_id = request.POST.get('comment_id')
        comment = Post_Comment.objects.get(id=comment_id)
        print(comment)
        if comment.created_by == user:
            comment.delete()
            return redirect('reel', reel_id=reel_id)
        
        


    
    # Likes

    post_stat_like_form = PostStatLikeForm(request.POST or None)
    if request.method == 'POST' and 'created_by' in request.POST:

        # Check if the user has already liked the post  
        if Post_Stat_like.objects.filter(post=post, created_by=user).exists():

            # User has already liked the post, so we can remove the like
            like = Post_Stat_like.objects.get(post=post, created_by=user)
            like.delete()
            return redirect('reel', reel_id=reel_id)
        
        # User has not liked the post yet, so we can add a like
        else:
            if post_stat_like_form.is_valid():
                like = post_stat_like_form.save(commit=False)
                like.post = post
                like.created_by = user
                like.save()
                return redirect('reel', reel_id=reel_id)
            



    context = {
        "first_reel": first_reel,
        "post": post,
        "reels": reels,
        "views": stats.get("view_count", "0"),
        "likes": stats.get("like_count", "0"),

        "post_comments": post_comments,
        "comment_form": post_comment_form,
        'post_stat_like': {
            'post_stat_like_form' : post_stat_like_form,
            'post_stat_likes': Post_Stat_like.objects.filter(post=post).count(),}
    }


    return render(request, 'video.html', context)





def search(request):

    query = request.GET.get('query', '')

    if query:
        posts = Post.objects.annotate(
            priority=Case(
                When(post_title__icontains=query, then=1),  # Higher priority for post_title matches
                When(created_by__username__icontains=query, then=2),  # Lower priority for username matches
                When(post_description__icontains=query, then=3),  # Lower priority for username matches
                default=4, # Default priority for no match
                output_field=IntegerField(),
            ),
            trending_score=Case(
                When(video_data__isnull=False, then=(F('video_data__like_count') * 2 + F('video_data__view_count'))),
                default=0,
                output_field=IntegerField(),
            )
        ).filter(
            Q(post_title__icontains=query) | Q(created_by__username__icontains=query) | Q(post_description__icontains=query)).order_by('priority', '-trending_score', '-created_at')    # Order by priority, trending_score, and created_at
        
        # Search for creators
        creators = User.objects.filter(
            Q(username__icontains=query) | Q(profile__first_name__icontains=query) | Q(profile__last_name__icontains=query)
        ).distinct().order_by('username')

    else:
        posts = []
        creators = []

    context = {
        'posts': posts,
        'creators': creators,
        'query': query,
    }

    return render(request, 'search.html', context)





def events(request):
    return render(request, 'events.html')


def messages(request):
    return render(request, 'messages.html')