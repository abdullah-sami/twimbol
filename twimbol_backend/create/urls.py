from django.urls import path
from . import views





urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('post/', views.post, name='post'),
    path('post/<int:post_id>', views.post_edit, name='post_create_edit'),
    
    path('video', views.video, name='video'),
    path('video/link', views.video_link, name='video_link'),
    path('video/upload', views.video_upload, name='video_upload'),
    
    path('reel/', views.reel, name='reel'),

    path('manage-contents/', views.manage_contents, name='manage-contents'),
    path('manage-contents/delete/<int:post_id>', views.delete_post, name='manage-contents-delete'),
    
    path('settings/', views.settings, name='settings'),
    path('apply-for-creator/', views.apply_for_creator, name='apply-for-creator'),

] 