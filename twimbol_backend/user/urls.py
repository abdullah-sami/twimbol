from django.urls import path, include
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework import routers

from . import views


router = routers.DefaultRouter()
<<<<<<< HEAD
=======

router.register('profile', views.PostViewSet, basename='posts')
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a

router.register('profile', views.ProfileViewSet, basename='posts')


urlpatterns = [
    path('', views.user_manager, name='user_manager'),
    path('profile/<str:profile_user_name>', views.profile, name='profile'),
    path('profile/<str:profile_user_name>/follow', views.follow, name='follow'),

<<<<<<< HEAD

    path('login/', CustomTokenObtainPairView.as_view(), name='login'),

=======
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a

    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

<<<<<<< HEAD

    path('api/', include(router.urls)),
]



=======
    path('api/', include(router.urls)),
]
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
