from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static, settings
from . import views
from rest_framework import routers


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)




router = routers.DefaultRouter()




urlpatterns = [
    path('admin/', admin.site.urls),
    path('control/', include('administration.urls')),
    path('', include('app.urls')),
    path('create/', include('create.urls')),
    path('user/', include('user.urls')),
    path('events/', include('event.urls')),
    path('messages/', include('message.urls')),


    path('youtube/', views.youtube, name='youtube'),
    path('authorize/callback/', views.oauth2callback, name='oauth2callback'),




    path('api/notifications/', include('notifications.urls')),

    path('api/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),


    path('api/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),










] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)





