from django.urls import path
from . import views



urlpatterns = [
    path('', views.home, name='home'),
    path('videos/', views.videos, name='videos'),
    path('events/', views.events, name='events'),
    path('messages/', views.messages, name='messages'),
    path('video/<str:video_id>', views.video, name='video'),
    path('reel/<str:reel_id>', views.reel, name='reel'),

    path('create/<str:create_action>/', views.create, name='create_action'),
]