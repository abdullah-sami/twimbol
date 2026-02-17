from django.urls import path, include
from . import views
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register('reel', ReelCloudinaryViewSet, basename='reel_upload')
router.register('video', VideoCloudinaryViewSet, basename='video_upload')

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('post/', views.post, name='post'),
    path('post/<int:post_id>', views.post_edit, name='post_create_edit'),
    # path('video', views.video, name='video'),
    path('video/link', views.video_link, name='video_link'),
    # path('video/upload', views.video_upload, name='video_upload'),
    path('', include(router.urls)),
    path('manage-contents/', views.manage_contents, name='manage-contents'),
    path('manage-contents/delete/<int:post_id>', views.delete_post, name='manage-contents-delete'),
    path('settings/', views.settings, name='creator_settings'),
    path('apply-for-creator/', views.apply_for_creator, name='apply-for-creator'),
]