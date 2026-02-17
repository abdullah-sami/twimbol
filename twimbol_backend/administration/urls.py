from django.urls import path
from . import views


urlpatterns = [
    path('', views.admin_home, name='administration'),
    path('creators/', views.creators, name='admin_creators'),
    path('users/', views.users, name='admin_users'),
    path('admins/', views.admins, name='admin_admins'),
    path('banned/', views.banned, name='admin_banned'),
]

