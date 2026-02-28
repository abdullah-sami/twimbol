# from django.urls import reverse
# from django.shortcuts import render, redirect, get_object_or_404
# from django.http import HttpResponse
# from .forms import *
# from .serializers import *
# from app.models import *
# from user.models import CreatorApplication
# from app.utils.youtube_api import get_video_data, upload_to_youtube, get_youtube_credentials
# from django.contrib.auth.decorators import login_required
# from user.decorators import admin_required, creator_required, visitor_required
# from event.models import *
# import tempfile

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.viewsets import ModelViewSet
# from rest_framework.decorators import api_view, action
# from rest_framework.pagination import PageNumberPagination
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.filters import SearchFilter, OrderingFilter
# from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, AllowAny



# from rest_framework.views import APIView
# from rest_framework.parsers import MultiPartParser, FormParser
# from .models import *
# from .serializers import *

# import cloudinary
# import cloudinary.uploader

# @login_required
# def dashboard(request):
#     user = request.user

#     if not user.groups.filter(name='admin').exists() and not user.groups.filter(name='creator').exists():
#         if CreatorApplication.objects.filter(user=user, application_status=0).exists():
#             creator_application_msg = "Already applied for creator"
        
#         return render(request, 'create.html', context={"create_action": "Not Allowed", "user": user, "creator_application_message": creator_application_msg if 'creator_application_msg' in locals() else None})

#     upload_message = ''

#     if request.method == "GET":
#         upload_message = request.GET.get("upload_message", "")


#     posts = Post.objects.all().filter(created_by=user).order_by("-created_at")
    

#     total_like_count = 0
#     for post in posts:
#         total_like_count += Post_Stat_like.objects.filter(post=post).count()


         
#     context={
#         "create_action": "dashboard",
#         "user": user,
#         "upload_message": upload_message,
#         "posts": posts,
#         "total_like_count": total_like_count,
#     }
#     return render(request, 'create.html', context)


# @creator_required
# def post(request):
#     form = PostForm()

#     if request.method == 'POST':
#         form = PostForm(request.POST, request.FILES)
        
#         user = request.user

#         form.instance.created_by = user
        
#         if form.is_valid():
#             form.save()
#             post = Post.objects.latest('id')
#             if form.cleaned_data.get('post_banner'):
#                 uploaded_file = form.cleaned_data['post_banner']
#                 if hasattr(uploaded_file, 'name'):  # Check if the uploaded file has a name attribute
#                     uploaded_file.name = f'img/posts/{uploaded_file.name}'
#                     post.post_banner = uploaded_file
#                     post.save()
        
                
#             return redirect(reverse('dashboard')+'?upload_message=success')
#     else:
#         form = PostForm()

#     context={
#         "create_action": "post",
#         "form": form,
#     }

#     return render(request, 'create.html', context)


# @creator_required
# def post_edit(request, post_id):
#     message = ''
#     try:
#         # Fetch the post by ID
#         post = Post.objects.get(id=post_id)
#     except Post.DoesNotExist:
#         # Handle the case where the post does not exist
#         return redirect(reverse('dashboard') + '?upload_message=post_not_found')

#     user = request.user
    
#     if post.created_by == user:
#         if request.method == 'POST':
#             form = PostForm(request.POST, request.FILES)
    
#             form.instance.created_by = user
            
#             if form.is_valid():
#                 Post.objects.filter(id=post_id).update(
#                     post_title=form.cleaned_data['post_title'],
#                     post_description=form.cleaned_data['post_description'],
#                     post_type=form.cleaned_data['post_type'])
#                 if form.cleaned_data.get('post_banner'):
#                     if form.cleaned_data.get('post_banner'):
#                         uploaded_file = form.cleaned_data['post_banner']
#                         uploaded_file.name = f'img/posts/{uploaded_file.name}'
#                         post.post_banner = uploaded_file
#                         post.save()
#                 elif post.post_banner :
#                     Post.objects.filter(id=post_id).update(
#                     post_banner=post.post_banner)
                


#                 message = "post edited"
#                 return redirect(reverse('dashboard')+'?upload_message=success')
            
#         else:
#             form = PostForm(instance=post)
#             message = 'edit post'

#     else:
#         message = "Cannot edit this post"
#         form = None

#     context={
#         "create_action": "post",
#         "post": post,
#         "form": form,
#         "message": message
#     }

#     return render(request, 'create.html', context)






# @creator_required
# def video(request):
#     return render(request, 'create.html', context={"create_action": "video"})


# @creator_required
# def video_link(request):
#     user = request.user
#     if request.method == 'POST':
#         form_yt_link = Youtube_Video_Id_Title_Form(request.POST)
#         if form_yt_link.is_valid():
#             form_yt_link.save()   

#             latest_video = Youtube_Video_Id_Title.objects.latest('id')
#             video_data = get_video_data(latest_video.video_id)

#             if video_data:
#                 Post.objects.create(post_type='youtube_video', post_title=video_data['title'], created_by=user)
#                 Youtube_Video_Data.objects.create(
#                     post=Post.objects.latest('id'),
#                     video_id=video_data['video_id'],
#                     video_title=video_data['title'],
#                     video_description=video_data['description'],
#                     thumbnail_url=video_data['thumbnail_url'],
#                     channel_title=video_data['channel_title'],
#                     channel_image_url=video_data['channel_image_url'],
#                     view_count=video_data['view_count'],
#                     like_count=video_data['like_count']
#                 )


#             return redirect(reverse('dashboard')+'?upload_message=success')

#         else:
#             return redirect(reverse('dashboard')+'?upload_message=failed')


#     else:
#         form_yt_link = Youtube_Video_Id_Title_Form() 




#     context={
#         "create_action": "video",
#         "form": form_yt_link
#     }

#     return render(request, 'create.html', context)

    

# @creator_required
# def video_upload(request):

#     user = request.user
    
    
#     if request.method == 'POST':
#         title = request.POST['title']
#         description = request.POST['description']
#         video_file = request.FILES['video']

#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
#             for chunk in video_file.chunks():
#                 temp.write(chunk)
#             video_path = temp.name

#         x = upload_to_youtube(video_path, title, description)
#         if x:
#             video_data = get_video_data(x.get('id'))
#             if video_data:
#                 Post.objects.create(post_type='youtube_video_upload', post_title=video_data['title'], created_by=user)
#                 Youtube_Video_Data.objects.create(
#                     post=Post.objects.latest('id'),
#                     video_id=video_data['video_id'],
#                     video_title=video_data['title'],
#                     video_description=video_data['description'],
#                     thumbnail_url=video_data['thumbnail_url'],
#                     channel_title=video_data['channel_title'],
#                     channel_image_url=video_data['channel_image_url'],
#                     view_count=video_data['view_count'],
#                     like_count=video_data['like_count']
#                 )
#                 if request.GET.get('event'):
#                     event = get_object_or_404(Event, id=request.GET.get('event'))
#                     event.posts.add(Post.objects.latest('id'))
#                     event.participants.add(user)
#                     event.save()
#                     return redirect(reverse('event_details', args=[event.id])+'?upload_message=success')

#             return redirect(reverse('dashboard')+'?upload_message=success')

#         else:
#             return redirect(reverse('dashboard')+'?upload_message=failed')




#     context={
#         "create_action": "video",
#         "user": user,
#         "video_upload": True
#     }


#     return render(request, 'create.html', context)







# @creator_required
# def reel(request):
#     user = request.user
    
    
#     if request.method == 'POST':
#         title = request.POST['title']
#         description = request.POST['description']
#         reel_file = request.FILES['video']

#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
#             for chunk in reel_file.chunks():
#                 temp.write(chunk)
#             video_path = temp.name

#         x = upload_to_youtube(video_path, title, description)
#         if x:
#             video_data = get_video_data(x.get('id'))
#             if video_data:
#                 Post.objects.create(post_type='youtube_reel', post_title=video_data['title'], created_by=user)
#                 Youtube_Reels_Data.objects.create(
#                     post=Post.objects.latest('id'),
#                     reel_id=video_data['video_id'],
#                     reel_title=video_data['title'],
#                     reel_description=video_data['description'],
#                     thumbnail_url=video_data['thumbnail_url'],
#                     channel_title=video_data['channel_title'],
#                     channel_image_url=video_data['channel_image_url'],
#                     view_count=video_data['view_count'],
#                     like_count=video_data['like_count']
#                 )
            
#             if request.GET.get('event'):
#                 event = get_object_or_404(Event, id=request.GET.get('event'))
#                 event.posts.add(Post.objects.latest('id'))
#                 event.participants.add(user)
#                 event.save()
#                 return redirect(reverse('event_details', args=[event.id])+'?upload_message=success')

#             return redirect(reverse('dashboard')+'?upload_message=success')

#         else:
#             return redirect(reverse('dashboard')+'?upload_message=failed')




#     context={
#         "create_action": "reel",
#         "user": user,
#         "reel_upload": True
#     }


#     return render(request, 'create.html', context)


#     # if request.method == 'POST':
#     #     form = Youtube_Reel_Id_Form(request.POST)

#     #     if form.is_valid():
#     #         form.save()   

            
#     #         latest_reel = Youtube_Reels_Id.objects.latest('id')
#     #         reel_data = get_video_data(latest_reel.reel_id)


#     #         if reel_data:
#     #             Post.objects.create(post_type='youtube_reel', post_title=reel_data['title'], created_by=request.user)
#     #             Youtube_Reels_Data.objects.create(
#     #                 post=Post.objects.latest('id'),
#     #                 reel_id=reel_data['video_id'],
#     #                 reel_title=reel_data['title'],
#     #                 reel_description=reel_data['description'],
#     #                 thumbnail_url=reel_data['thumbnail_url'],
#     #                 channel_title=reel_data['channel_title'],
#     #                 channel_image_url=reel_data['channel_image_url'],
#     #                 view_count=reel_data['view_count'],
#     #                 like_count=reel_data['like_count']
#     #             )
        
#     #         return redirect('home')

#     # else:
#     #     form = Youtube_Reel_Id_Form()

#     # context={
#     #         "create_action": "reel",
#     #         "form": form
#     #     }

#     # return render(request, 'create.html', context)






# @creator_required
# def manage_contents(request):
#     user = request.user

#     upload_message = ''

#     if request.method == "GET":
#         upload_message = request.GET.get("upload_message", "")


#     posts = Post.objects.all().filter(created_by=user).order_by("-created_at")

#     total_view_count = 0
#     total_like_count = 0

#     for post in posts:
#         if(getattr(post, 'video_data', None)):
#             total_view_count += getattr(post, 'video_data', None).view_count
#             total_like_count += getattr(post, 'video_data', None).like_count
         
#     context={
#         "create_action": "manage-contents",
#         "user": user,
#         "upload_message": upload_message,
#         "posts": posts,
        
#     }
#     return render(request, 'create.html', context)




# @creator_required
# def delete_post(request, post_id):

#     post = get_object_or_404(Post, id=post_id, created_by=request.user)

#     if request.method == 'POST':
#         form = PostDeleteForm(request.POST)
#         if form.is_valid():
#             post.delete()
#             return redirect(reverse('manage-contents')+'?upload_message=post_deleted')
#     else:
#         form = PostDeleteForm()

#     return render(request, 'create.html', {'create_action': "delete",'form': form, 'post': post,})









# @creator_required
# def settings(request):
    
#     return render(request, 'create.html', context={"create_action": "settings"})








# @login_required
# def apply_for_creator(request):
#     user = request.user

#     if request.method == 'POST':
#         CreatorApplication.objects.create(user=user)
#         return redirect(reverse('dashboard')+'?upload_message=creator_application_submitted')
    
#     if CreatorApplication.objects.filter(user=user).exists():
#         return redirect(reverse('dashboard')+'?upload_message=creator_application_already_submitted')
    

#     context={
#         "create_action": "apply-for-creator",
#     }

#     return render(request, 'apply.html', context)









# class ApplyForCreatorViewSet(ModelViewSet):
#     queryset = CreatorApplication.objects.all()
#     serializer_class = CreatorApplicationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return CreatorApplication.objects.filter(user=self.request.user)

#     def create(self, request, *args, **kwargs):
#         # Prevent duplicate applications
#         if CreatorApplication.objects.filter(user=request.user).exists():
#             return Response(
#                 {"detail": "You have already applied for creator."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Create a new creator application
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(user=request.user)
#         return Response(
#             {"detail": "Creator application submitted successfully."},
#             status=status.HTTP_201_CREATED
#         )

#     @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
#     def by_user(self, request, user_id=None):
#         # Allow admin/staff or user themselves to see applications by user ID
#         if not request.user.is_staff and str(request.user.id) != str(user_id):
#             return Response(
#                 {"detail": "You do not have permission to view this user's applications."},
#                 status=status.HTTP_403_FORBIDDEN
#             )

#         applications = CreatorApplication.objects.filter(user_id=user_id)
#         serializer = self.get_serializer(applications, many=True)
#         return Response(serializer.data)
    














# # class ReelUploadView(APIView):
# #     parser_classes = (MultiPartParser, FormParser)

# #     def post(self, request, *args, **kwargs):
# #         video_file = request.FILES.get('video')
# #         title = request.data.get('title', '')

# #         if not video_file:
# #             return Response(
# #                 {'error': 'No video file provided'},
# #                 status=status.HTTP_400_BAD_REQUEST
# #             )

# #         try:
# #             # Upload to Cloudinary
# #             upload_result = cloudinary.uploader.upload_large(
# #                 video_file,
# #                 resource_type="video",
# #                 chunk_size=6000000,  # 6MB chunks
# #                 folder="videos"
# #             )

# #             # Save to database
# #             video = ReelCloudinary.objects.create(
# #                 title=title,
# #                 video_url=upload_result['secure_url']
# #             )

# #             serializer = VideoSerializer(video)
# #             return Response(serializer.data, status=status.HTTP_201_CREATED)

# #         except Exception as e:
# #             return Response(
# #                 {'error': str(e)},
# #                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #             )
        





# from rest_framework.viewsets import ModelViewSet
# from .models import *
# from .serializers import *
# from notifications.models import Notification



# class ReelCloudinaryViewSet(ModelViewSet):


#     queryset = ReelCloudinary.objects.all()
#     serializer_class = ReelCloudinarySerializer
#     permission_classes = [IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)

#     def create(self, request, *args, **kwargs):
#         video_file = request.FILES.get('video')
#         title = request.data.get('title', '')
#         reel_description = request.data.get('description', '')

#         if not video_file:
#             return Response(
#                 {'error': 'No video file provided'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             # Upload to Cloudinary
#             upload_result = cloudinary.uploader.upload_large(
#                 video_file,
#                 resource_type="video",
#                 chunk_size=6000000,  # 6MB chunks
#                 folder="reels",
#             )

#             # Create a Post instance
#             post = Post.objects.create(
#                 post_type='reel',
#                 post_title=title,
#                 post_description=reel_description,
#                 created_by=request.user
#             )
#             Notification.objects.create(
#                 user=request.user,
#                 message=f"Reel uploaded!",
#                 page="reel",  # Example page
#                 page_item_id=post.id  # Optional, can be set to a specific ID if needed
#             )
#             # Save to ReelCloudinary model
#             serializer = self.get_serializer(data={
#                 'title': title,
#                 'video_url': upload_result['secure_url'],
#                 'reel_description': reel_description,
#                 'thumbnail_url': upload_result['secure_url'].replace('.mp4', '.png'),
#                 'created_by': request.user.id,
#                 'post': post.id
#             })

#             serializer.is_valid(raise_exception=True)
#             serializer.save()

#             return Response(serializer.data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print(f"Error: {str(e)}")  # Log the error to the console
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )



# class VideoCloudinaryViewSet(ModelViewSet):


#     queryset = VideoCloudinary.objects.all()
#     serializer_class = VideoCloudinarySerializer
#     permission_classes = [IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)

#     def create(self, request, *args, **kwargs):
#         video_file = request.FILES.get('video')
#         title = request.data.get('title', '')
#         video_description = request.data.get('description', '')

#         if not video_file:
#             return Response(
#                 {'error': 'No video file provided'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             # Upload to Cloudinary
#             upload_result = cloudinary.uploader.upload_large(
#                 video_file,
#                 resource_type="video",
#                 chunk_size=6000000,  # 6MB chunks
#                 folder="videos",
#             )

#             print(upload_result)

#             # Create a Post instance
#             post = Post.objects.create(
#                 post_type='video',
#                 post_title=title,
#                 post_description=video_description,
#                 created_by=request.user
#             )

#             # Save to ReelCloudinary model
#             serializer = self.get_serializer(data={
#                 'title': title,
#                 'video_url': upload_result['secure_url'],
#                 'video_description': video_description,
#                 'thumbnail_url': upload_result['secure_url'].replace('.mp4', '.png'),
#                 'created_by': request.user.id,
#                 'post': post.id
#             })

#             serializer.is_valid(raise_exception=True)
#             serializer.save()

#             return Response(serializer.data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print(f"Error: {str(e)}")  # Log the error to the console
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )














































































"""
create/views.py

All views are REST API only.
Reels and videos are uploaded to Cloudinary by the frontend;
the backend only receives and stores the resulting data.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import JSONParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.db import transaction
from rest_framework.decorators import action
from django.db.models import F

from app.models import Post, Post_Stat_like, Post_Comment
from app.serializers import PostSerializer
from user.models import CreatorApplication, Follower
from notifications.models import Notification

from .models import ReelCloudinary, VideoCloudinary
from .serializers import (
    ReelCloudinarySerializer,
    VideoCloudinarySerializer,
    CreatorApplicationSerializer,
)


# ---------------------------------------------------------------------------
# Shared pagination
# ---------------------------------------------------------------------------

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })


# ---------------------------------------------------------------------------
# Helper: check creator/admin permission
# ---------------------------------------------------------------------------

def _is_creator_or_admin(user):
    return user.groups.filter(name__in=['creator', 'admin']).exists()


# ---------------------------------------------------------------------------
# 1. Reel — receive data only (frontend uploads to Cloudinary)
# ---------------------------------------------------------------------------

class ReelCloudinaryViewSet(ModelViewSet):
    """
    Endpoints:
        POST   create/api/reel/          — create reel record (data from frontend)
        GET    create/api/reel/          — list all reels
        GET    create/api/reel/<pk>/     — retrieve a reel
        PUT    create/api/reel/<pk>/     — update a reel (owner only)
        PATCH  create/api/reel/<pk>/     — partial update (owner only)
        DELETE create/api/reel/<pk>/     — delete a reel (owner only)

    Expected POST body (JSON):
        {
            "title":            "My Reel",
            "video_url":        "https://res.cloudinary.com/.../reel.mp4",
            "thumbnail_url":    "https://res.cloudinary.com/.../thumb.jpg",
            "reel_description": "Optional description"
        }
    """

    queryset = ReelCloudinary.objects.select_related('created_by', 'post').order_by('-created_at')
    serializer_class = ReelCloudinarySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    pagination_class = StandardPagination

    def create(self, request, *args, **kwargs):
        if not _is_creator_or_admin(request.user):
            return Response(
                {'detail': 'Only creators and admins can upload reels.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        video_url = request.data.get('video_url')
        thumbnail_url = request.data.get('thumbnail_url')
        title = request.data.get('title', '')
        reel_description = request.data.get('reel_description', '')

        if not video_url:
            return Response(
                {'detail': 'video_url is required. Upload the video to Cloudinary from the frontend first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create parent Post
        post = Post.objects.create(
            post_type='reel',
            post_title=title,
            post_description=reel_description,
            created_by=request.user,
        )

        serializer = self.get_serializer(data={
            'title': title,
            'video_url': video_url,
            'reel_description': reel_description,
            'thumbnail_url': thumbnail_url,
            'created_by': request.user.id,
            'post': post.id,
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        Notification.objects.create(
            user=request.user,
            message=f"Your reel '{title}' was published!",
            page='reel',
            page_item_id=post.id,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        # Cascade: deleting the Post will delete the ReelCloudinary via OneToOne
        instance.post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny], url_path='record-view')
    def record_view(self, request, pk=None):
        reel = self.get_object()
        ReelCloudinary.objects.filter(pk=pk).update(view_count=F('view_count') + 1)
        return Response({'status': 'ok'})


# ---------------------------------------------------------------------------
# 2. Video — receive data only (frontend uploads to Cloudinary)
# ---------------------------------------------------------------------------

class VideoCloudinaryViewSet(ModelViewSet):
    """
    Endpoints:
        POST   create/api/video/          — create video record (data from frontend)
        GET    create/api/video/          — list all videos
        GET    create/api/video/<pk>/     — retrieve a video
        PUT    create/api/video/<pk>/     — update (owner only)
        PATCH  create/api/video/<pk>/     — partial update (owner only)
        DELETE create/api/video/<pk>/     — delete (owner only)

    Expected POST body (JSON):
        {
            "title":             "My Video",
            "video_url":         "https://res.cloudinary.com/.../video.mp4",
            "thumbnail_url":     "https://res.cloudinary.com/.../thumb.jpg",
            "video_description": "Optional description"
        }
    """

    queryset = VideoCloudinary.objects.select_related('created_by', 'post').order_by('-created_at')
    serializer_class = VideoCloudinarySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    pagination_class = StandardPagination

    def create(self, request, *args, **kwargs):
        if not _is_creator_or_admin(request.user):
            return Response(
                {'detail': 'Only creators and admins can upload videos.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        video_url = request.data.get('video_url')
        thumbnail_url = request.data.get('thumbnail_url')
        title = request.data.get('title', '')
        video_description = request.data.get('video_description', '')

        if not video_url:
            return Response(
                {'detail': 'video_url is required. Upload the video to Cloudinary from the frontend first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create parent Post
        post = Post.objects.create(
            post_type='video',
            post_title=title,
            post_description=video_description,
            created_by=request.user,
        )

        serializer = self.get_serializer(data={
            'title': title,
            'video_url': video_url,
            'video_description': video_description,
            'thumbnail_url': thumbnail_url,
            'created_by': request.user.id,
            'post': post.id,
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()

        Notification.objects.create(
            user=request.user,
            message=f"Your video '{title}' was published!",
            page='video',
            page_item_id=post.id,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        instance.post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny], url_path='record-view')
    def record_view(self, request, pk=None):
        VideoCloudinary.objects.filter(pk=pk).update(view_count=F('view_count') + 1)
        return Response({'status': 'ok'})

# ---------------------------------------------------------------------------
# 3. Post CRUD (text/image posts)
# ---------------------------------------------------------------------------

class PostAPIViewSet(ModelViewSet):
    """
    Endpoints:
        POST   create/api/post/          — create a text/image post
        GET    create/api/post/          — list posts (own posts for creators)
        GET    create/api/post/<pk>/     — retrieve a post
        PUT    create/api/post/<pk>/     — update (owner only)
        PATCH  create/api/post/<pk>/     — partial update (owner only)
        DELETE create/api/post/<pk>/     — delete (owner only)

    Expected POST body (JSON):
        {
            "post_type":        "post",
            "post_title":       "Hello World",
            "post_description": "Optional description",
            "post_banner":      "https://..." (optional, URL if hosted externally)
        }
    """

    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    pagination_class = StandardPagination

    def get_queryset(self):
        # Authenticated users see their own posts via this endpoint
        return Post.objects.filter(
            created_by=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if not _is_creator_or_admin(self.request.user):
            raise PermissionError('Only creators and admins can create posts.')
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        if not _is_creator_or_admin(request.user):
            return Response(
                {'detail': 'Only creators and admins can create posts.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


# ---------------------------------------------------------------------------
# 4. Creator Posts — return post information of posts created by a creator
# ---------------------------------------------------------------------------

class CreatorPostsViewSet(ViewSet):
    """
    Endpoints:
        GET  create/api/creator/<user_id>/posts/   — all posts by a specific creator (public)
        GET  create/api/creator/my-posts/          — authenticated creator's own posts

    Both endpoints return posts with their associated reel/video data when available.
    Supports ?post_type=<reel|video|post> query param for filtering.
    Supports ?page and ?page_size for pagination.
    """

    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination

    def _paginate(self, request, queryset):
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PostSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def list(self, request, user_id=None):
        """GET create/api/creator/<user_id>/posts/"""
        queryset = Post.objects.filter(created_by_id=user_id).order_by('-created_at')

        post_type = request.query_params.get('post_type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)

        return self._paginate(request, queryset)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        """GET create/api/creator/my-posts/"""
        queryset = Post.objects.filter(created_by=request.user).order_by('-created_at')

        post_type = request.query_params.get('post_type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)

        return self._paginate(request, queryset)


# ---------------------------------------------------------------------------
# 5. Manage Contents — creator's own content management
# ---------------------------------------------------------------------------

class ManageContentsViewSet(ViewSet):
    """
    Endpoints:
        GET    create/api/manage-contents/          — list authenticated creator's posts
        DELETE create/api/manage-contents/<post_id>/ — delete a specific post (owner only)
    """

    permission_classes = [IsAuthenticated]

    def list(self, request):
        if not _is_creator_or_admin(request.user):
            return Response(
                {'detail': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        posts = Post.objects.filter(created_by=request.user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})

        total_likes = sum(
            Post_Stat_like.objects.filter(post=post).count() for post in posts
        )

        return Response({
            'total_posts': posts.count(),
            'total_likes': total_likes,
            'posts': serializer.data,
        })

    def destroy(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)

        if post.created_by != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        post.delete()
        return Response({'detail': 'Post deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# 6. Apply for Creator — reused in user/urls.py via import
# ---------------------------------------------------------------------------

class ApplyForCreatorViewSet(ModelViewSet):
    """
    Endpoints:
        POST  create/api/apply-for-creator/                          — submit application
        GET   create/api/apply-for-creator/by-user/<user_id>/        — get by user (self or admin)
    """

    queryset = CreatorApplication.objects.all().order_by('-created_at')
    serializer_class = CreatorApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user

        if CreatorApplication.objects.filter(user=user, application_status=0).exists():
            return Response(
                {'detail': 'You already have a pending application.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)

        return Response(
            {'detail': 'Application submitted successfully.', 'data': serializer.data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        if not request.user.is_staff and str(request.user.id) != str(user_id):
            return Response(
                {'detail': "You do not have permission to view this user's applications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        applications = CreatorApplication.objects.filter(user_id=user_id)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# 7. Creator Analytics
# ---------------------------------------------------------------------------

class CreatorAnalyticsView(APIView):
    """
    Returns aggregated stats for a creator in a single, DB-efficient response.

    Endpoints:
        GET  create/api/analytics/me/               — authenticated creator's own stats
        GET  create/api/analytics/<user_id>/        — any creator's public stats

    Response shape:
        {
            "user_id":        12,
            "username":       "jane_doe",
            "total_posts":    42,
            "total_likes":    1380,
            "total_views":    29500,
            "total_followers": 834
        }

    DB strategy (4 queries total, no per-post loops):
        Q1 — Post.objects.filter(created_by=user).aggregate(Count)
        Q2 — Post_Stat_like.objects.filter(post__created_by=user).aggregate(Count)
        Q3 — ReelCloudinary + VideoCloudinary view_count summed via aggregate(Sum)
        Q4 — Follower.objects.filter(following=user).aggregate(Count)
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    def _get_stats(self, user: User) -> dict:
        # ── Q1: total posts (all types) ──────────────────────────────────────
        total_posts = Post.objects.filter(created_by=user).count()

        # ── Q2: total likes across all creator's posts ───────────────────────
        # One JOIN query: Post_Stat_like → Post via post__created_by
        total_likes = Post_Stat_like.objects.filter(
            post__created_by=user
        ).count()

        # ── Q3: total views — sum view_count stored on reel & video records ──
        # Reels view_count is stored on ReelCloudinary
        reel_views = (
            ReelCloudinary.objects
            .filter(created_by=user)
            .aggregate(total=Sum('view_count'))['total'] or 0
        )
        # Videos view_count is stored on VideoCloudinary
        video_views = (
            VideoCloudinary.objects
            .filter(created_by=user)
            .aggregate(total=Sum('view_count'))['total'] or 0
        )
        total_views = reel_views + video_views

        # ── Q4: total followers ──────────────────────────────────────────────
        total_followers = Follower.objects.filter(following=user).count()

        return {
            'user_id':         user.id,
            'username':        user.username,
            'total_posts':     total_posts,
            'total_likes':     total_likes,
            'total_views':     total_views,
            'total_followers': total_followers,
        }

    def get(self, request, user_id=None):
        if user_id is None:
            # /analytics/me/ — must be authenticated
            if not request.user.is_authenticated:
                return Response(
                    {'detail': 'Authentication required.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            user = request.user
        else:
            user = get_object_or_404(User, pk=user_id)

        return Response(self._get_stats(user), status=status.HTTP_200_OK)