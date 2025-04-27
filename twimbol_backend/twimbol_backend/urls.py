from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static, settings
from . import views
from rest_framework import routers





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





] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
