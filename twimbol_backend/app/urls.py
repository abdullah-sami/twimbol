from django.urls import path, include
from . import views
from rest_framework import routers


router = routers.DefaultRouter()
router.register('posts', views.PostViewSet, basename='posts')
router.register('reels', views.ReelsDataViewSet, basename='reels')
router.register('videos', views.YtVideoDataViewSet, basename='videos')
# router.register('posts/<str:post_id>/comments', views.PostCommentViewSet, basename='post_comments')
router.register('search', views.SearchViewSet, basename='search_api')



urlpatterns = [

    path('api/', include(router.urls)),
    path('api/posts/<int:post_id>/comments/', views.PostCommentViewSet.as_view({
        'get': 'list',
        'post': 'create',
        'delete': 'destroy',
    }), name='post_comments'),

    path('api/post_likes/<int:post_id>/', views.PostStatLikeViewSet.as_view({
        'get': 'list',
        'post': 'create',
        'delete': 'destroy'
    }), name='post_likes'),


    path('', views.home, name='home'),

    # Function-based views
    path('post/<str:post_id>/', views.post, name='post'),
    path('videos/', views.videos, name='videos'),
    path('video/<str:video_id>/', views.video, name='video'),
    path('reel/<str:reel_id>/', views.reel, name='reel'),


    path('privacy-policy/', views.privacy, name='privacy'),

    path('search/', views.search, name='search'),

    path('search/', views.search, name='settings'),
    
    

    
]