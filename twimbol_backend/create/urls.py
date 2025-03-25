from django.urls import path
from . import views





urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('post/', views.post, name='post'),
    path('video/', views.video, name='video'),
    path('reel/', views.reel, name='reel'),
    path('manage-contents/', views.manage_contents, name='manage-contents'),
    path('settings/', views.settings, name='settings'),

] 