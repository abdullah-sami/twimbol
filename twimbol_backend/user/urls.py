from django.urls import path, include
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework import routers

from . import views
from create.views import ApplyForCreatorViewSet

router = routers.DefaultRouter()
router.register('profile', views.UserProfileViewSet, basename='user_profile')
router.register('register', views.RegisterViewSet, basename='register')
router.register('update', views.UpdateProfileViewSet, basename='update-profile')
router.register('creator-application', ApplyForCreatorViewSet, basename='apply-for-creator')

router.register('profile', views.ProfileViewSet, basename='posts')


urlpatterns = [
    path('', views.user_manager, name='user_manager'),
    path('profile/<str:profile_user_name>', views.profile, name='profile'),
    path('profile/<str:profile_user_name>/follow', views.follow, name='follow'),


    path('login/', CustomTokenObtainPairView.as_view(), name='login'),


    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),


    path('api/', include(router.urls)),
]