from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', include('user_profile.urls')),
    path('', include('app.urls')),
    # path('video/', include('yt_video.urls')),
    # path('event/', include('events.urls')),
]
