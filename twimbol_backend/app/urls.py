from django.urls import path, include
from . import views
from rest_framework import routers


router = routers.DefaultRouter()
router.register('posts', views.PostViewSet, basename='posts')
router.register('reels', views.ReelsDataViewSet, basename='reels')
router.register('videos', views.YtVideoDataViewSet, basename='videos')
router.register('post_comments', views.PostCommentViewSet, basename='post_comments')
router.register('post_likes', views.PostStatLikeViewSet, basename='post_likes')
router.register('search', views.SearchViewSet, basename='search_api')



urlpatterns = [

    path('api/', include(router.urls)),

    path('', views.home, name='home'),

    # Function-based views
    path('post/<str:post_id>/', views.post, name='post'),
    path('videos/', views.videos, name='videos'),
    path('video/<str:video_id>/', views.video, name='video'),
    path('reel/<str:reel_id>/', views.reel, name='reel'),


    path('search/', views.search, name='search'),

    path('search/', views.search, name='settings'),
    
    

    
]