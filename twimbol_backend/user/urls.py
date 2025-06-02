from django.urls import path, include
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework import routers

from . import views
from create.views import ApplyForCreatorViewSet

router = routers.DefaultRouter()
<<<<<<< HEAD
=======

<<<<<<< HEAD
router.register('profile', views.UserProfileViewSet, basename='user_profile')
router.register('register', views.RegisterViewSet, basename='register')
router.register('update', views.UpdateProfileViewSet, basename='update-profile')
router.register('creator-application', ApplyForCreatorViewSet, basename='apply-for-creator')
=======
router.register('profile', views.PostViewSet, basename='posts')
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a

router.register('profile', views.ProfileViewSet, basename='posts')
>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e


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
<<<<<<< HEAD
] 
=======
]



=======
    path('api/', include(router.urls)),
]
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
>>>>>>> 5b0fbc5ffc30db7e6f593372f85ccb7d121db10e
