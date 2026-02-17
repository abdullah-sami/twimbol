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
router.register('deactivate', views.DeactivateProfileViewSet, basename='deactivate')
router.register('creator-application', ApplyForCreatorViewSet, basename='apply-for-creator')

# router.register('profile', views.ProfileViewSet, basename='posts')


urlpatterns = [
    path('', views.user_manager, name='user_manager'),
    path('profile/<str:profile_user_name>', views.profile, name='profile'),
    path('profile/follow/', views.FollowViewSet.as_view({'post': 'create'}), name='follow'),
    path('profile/block/', views.BlockViewSet.as_view({'post': 'create'}), name='block'),



    path('login/', CustomTokenObtainPairView.as_view(), name='login'),


    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', views.RequestPasswordResetView.as_view(), name='forgot-password'),
    path('reset-password-confirm/', views.ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),
    # path('deactivate/', views.UpdateProfileViewSet.as_view(), name='deactivate-account'),
    path('delete/', views.DeleteAccountView.as_view(), name='delete-account'),

 
    path('api/', include(router.urls)),
]