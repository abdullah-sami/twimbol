from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_manager, name='user_manager'),
    path('profile/<str:profile_user_name>', views.profile, name='profile'),
    path('profile/<str:profile_user_name>/follow', views.follow, name='follow'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
]