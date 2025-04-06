from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static, settings
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('control/', include('administration.urls')),
    path('', include('app.urls')),
    path('create/', include('create.urls')),
    path('user/', include('user.urls')),

    path('youtube/', views.youtube, name='youtube'),
    path('authorize/callback/', views.oauth2callback, name='oauth2callback'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
