from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from .utils.youtube_api import get_video_data, get_video_stats
from django.db.models import Q, Case, When, IntegerField, F
from .models import *
from .forms import *
from django.urls import reverse

from .serializers import *
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, action
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, AllowAny
# import validation error
from rest_framework.exceptions import ValidationError

from create.models import *
from create.serializers import *

from user.models import Block


class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.page_size,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })




class PostViewSet(ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = PostPagination

    filter_backends = [SearchFilter, OrderingFilter]
    filterset_fields = ['post_type']
    search_fields = ['post_title', 'post_description']
    ordering_fields = ['post_type', 'created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.filter(post_type='post').order_by('-created_at')

        if user.is_authenticated:
            # Exclude hidden posts
            hidden_posts = Post_Stat_hide.objects.filter(created_by=user).values_list("post_id", flat=True)
            queryset = queryset.exclude(id__in=hidden_posts)

            # Exclude reported posts
            reported_posts = Post_Stat_report.objects.filter(created_by=user).values_list("post_id", flat=True)
            queryset = queryset.exclude(id__in=reported_posts)

            # Exclude posts from blocked users
            blocked_users = Block.objects.filter(blocker=user).values_list("blocked_id", flat=True)
            queryset = queryset.exclude(created_by_id__in=blocked_users)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, post_type="post")








class ReelsPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.page_size,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })




class ReelsDataViewSet(ModelViewSet):
    serializer_class = ReelCloudinarySerializer
    permission_classes = [AllowAny]
    pagination_class = ReelsPagination

    def get_queryset(self):
        user = self.request.user
        queryset = ReelCloudinary.objects.all().order_by('-created_at')

        if user.is_authenticated:
            # exclude hidden posts
            hidden_posts = Post_Stat_hide.objects.filter(created_by=user).values_list("post_id", flat=True)
            queryset = queryset.exclude(post_id__in=hidden_posts)

            # exclude reported posts
            reported_posts = Post_Stat_report.objects.filter(created_by=user).values_list("post_id", flat=True)
            queryset = queryset.exclude(post_id__in=reported_posts)

            # exclude posts from blocked users
            blocked_users = Block.objects.filter(blocker=user).values_list("blocked_id", flat=True)
            queryset = queryset.exclude(created_by_id__in=blocked_users)

        return queryset





class SearchViewSet(ModelViewSet):
    serializer_class = PostSearchSerializer  # Specify the serializer class


    def list(self, request):
        query = self.request.GET.get('query', '')

        if query:
            queryset = Post.objects.annotate(
                priority=Case(
                    When(post_title__icontains=query, then=1),
                    When(post_type__iexact='reel', then=2),
                    When(created_by__username__icontains=query, then=3),
                    When(post_description__icontains=query, then=4),
                    default=5,
                    output_field=IntegerField(),
                ),
                trending_score=Case(
                    When(video_data__isnull=False, then=(F('video_data__like_count') * 2 + F('video_data__view_count'))),
                    default=0,
                    output_field=IntegerField(),
                )
            ).filter(
                (Q(post_title__icontains=query) |
                Q(created_by__username__icontains=query) |
                Q(post_type__icontains="post") |
                Q(post_description__icontains=query) )
                & Q(post_type__icontains="reel")
            ).order_by('priority', '-trending_score', '-created_at')

        else:
            queryset = Post.objects.none()

        serializer = self.serializer_class(
            queryset,
            many=True,
            context={'request': request}   # ✅ inject request into context
        )
        return Response({
            'query': query,
            'results': serializer.data,
        })







class PostStatLikeViewSet(ModelViewSet):
    queryset = Post_Stat_like.objects.all().order_by('-created_at')
    serializer_class = PostStatLikeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'post_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.kwargs.get('post_id')
        if post_id:
            try:
                return queryset.filter(post_id=post_id)
            except:
                return queryset.filter(post=post_id)
        return queryset.none()

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')

        # Check if like already exists - try both field names
        try:
            existing_like = Post_Stat_like.objects.filter(post_id=post_id, created_by=self.request.user)
            if existing_like.exists():
                raise ValidationError({"detail": "You already liked this post."})
            # Save with post_id field
            serializer.save(created_by=self.request.user, post_id=post_id)
        except Exception as e:
            print(f"DEBUG: Trying with 'post' field instead. Error was: {e}")
            # If that fails, try with 'post' field
            existing_like = Post_Stat_like.objects.filter(post=post_id, created_by=self.request.user)
            if existing_like.exists():
                raise ValidationError({"detail": "You already liked this post."})
            serializer.save(created_by=self.request.user, post=post_id)

    def destroy(self, request, *args, **kwargs):
        # Get the specific like for this user and post
        post_id = self.kwargs.get('post_id')
        
        try:
            instance = Post_Stat_like.objects.get(
                post_id=post_id, 
                created_by=request.user
            )
        except Post_Stat_like.DoesNotExist:
            return Response(
                {"detail": "Like not found or you don't have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Post_Stat_like.MultipleObjectsReturned:
            # If somehow there are multiple likes, delete all of them for this user
            Post_Stat_like.objects.filter(
                post_id=post_id, 
                created_by=request.user
            ).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)





class PostStatHideViewSet(ModelViewSet):
    queryset = Post_Stat_hide.objects.all().order_by('-created_at')
    serializer_class = PostStatHideSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'post_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.kwargs.get('post_id')
        if post_id:
            try:
                return queryset.filter(post_id=post_id)
            except:
                return queryset.filter(post=post_id)
        return queryset.none()

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')

        # Check if like already exists - try both field names
        try:
            existing_hide = Post_Stat_hide.objects.filter(post_id=post_id, created_by=self.request.user)
            if existing_hide.exists():
                raise ValidationError({"detail": "You already hid this post."})
            # Save with post_id field
            serializer.save(created_by=self.request.user, post_id=post_id)
        except Exception as e:
            print(f"DEBUG: Trying with 'post' field instead. Error was: {e}")
            # If that fails, try with 'post' field
            existing_hide = Post_Stat_hide.objects.filter(post=post_id, created_by=self.request.user)
            if existing_hide.exists():
                raise ValidationError({"detail": "You already hid this post."})
            serializer.save(created_by=self.request.user, post=post_id)

    def destroy(self, request, *args, **kwargs):
        # Get the specific hide for this user and post
        post_id = self.kwargs.get('post_id')
        
        try:
            instance = Post_Stat_hide.objects.get(
                post_id=post_id,
                created_by=request.user
            )
        except Post_Stat_hide.DoesNotExist:
            return Response(
                {"detail": "Hide not found or you don't have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Post_Stat_hide.MultipleObjectsReturned:
            # If somehow there are multiple hides, delete all of them for this user
            Post_Stat_hide.objects.filter(
                post_id=post_id, 
                created_by=request.user
            ).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)





class PostStatReportViewSet(ModelViewSet):
    serializer_class = PostStatReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'post_id'

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        if post_id:
            return Post_Stat_report.objects.filter(post_id=post_id)
        return Post_Stat_report.objects.none()

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')

        # Prevent duplicate reports
        if Post_Stat_report.objects.filter(post_id=post_id, created_by=self.request.user).exists():
            raise ValidationError({"detail": "You already reported this post."})

        serializer.save(
            created_by=self.request.user,
            post_id=post_id
        )

    def destroy(self, request, *args, **kwargs):
        post_id = self.kwargs.get('post_id')

        reports = Post_Stat_report.objects.filter(
            post_id=post_id,
            created_by=request.user
        )

        if not reports.exists():
            return Response(
                {"detail": "Report not found or you don't have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )

        reports.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)











































class CommentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.page_size,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })




class PostCommentViewSet(ModelViewSet):
    queryset = Post_Comment.objects.all().order_by('-created_at')
    serializer_class = PostCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = CommentPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.kwargs.get('post_id')
        if post_id:
            return queryset.filter(post_id=post_id)
        return queryset.none()

    def perform_create(self, serializer):

        post_id = self.kwargs.get('post_id')
        post = Post.objects.filter(id=post_id).first()
        serializer.save(created_by=self.request.user, post=post)

    def destroy(self, request, *args, **kwargs):
        post_id = self.kwargs.get('post_id')
        comment_id = request.data.get('comment_id')
        
        try:
            instance = Post_Comment.objects.get(
                post_id=post_id, 
                id=comment_id,
                created_by=request.user
            )
        except Post_Comment.DoesNotExist:
            return Response(
                {"detail": "Comment not found or you don't have permission to delete it."},
                status=status.HTTP_404_NOT_FOUND
            )
                
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)














class YtVideoDataViewSet(ModelViewSet):
    queryset = Youtube_Video_Data.objects.all().order_by('post_id')
    serializer_class = YoutubeVideoDataSerializer































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
            if post_stat_like_form.is_valid():
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




@api_view(['GET'])
def post_api(request, post_id):
    post = Post.objects.get(id=post_id)
    post_serializer = PostSerializer(post)

    post_comments = Post_Comment.objects.filter(post=post).order_by('-created_at')
    post_comment_serializer = PostCommentSerializer(post_comments, many=True)


    post_stat_like = Post_Stat_like.objects.filter(post=post).order_by('-created_at')
    post_stat_like_serializer = PostStatLikeSerializer(post_stat_like, many=True)

    post_stat_like_count = Post_Stat_like.objects.filter(post=post).count()
    post_stat_like_serializer = PostStatLikeSerializer(post_stat_like, many=True)
    post_stat_is_liked = Post_Stat_like.objects.filter(post=post, created_by=request.user).exists()





    return Response({
        "post": post_serializer.data,
        "post_comments": post_comment_serializer.data,
        "post_stat_like": post_stat_like_serializer.data,
        "post_stat_like_count": post_stat_like_count,
        "post_stat_is_liked": post_stat_is_liked,
    })












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








def privacy(request):
    return render(request, 'privacy-policy.html')