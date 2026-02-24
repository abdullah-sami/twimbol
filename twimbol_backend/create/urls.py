# from django.urls import path, include
# from . import views
# from rest_framework import routers
# from .views import *

# router = routers.DefaultRouter()
# router.register('reel', ReelCloudinaryViewSet, basename='reel_upload')
# router.register('video', VideoCloudinaryViewSet, basename='video_upload')

# urlpatterns = [
#     path('dashboard/', views.dashboard, name='dashboard'),
#     path('post/', views.post, name='post'),
#     path('post/<int:post_id>', views.post_edit, name='post_create_edit'),
#     # path('video', views.video, name='video'),
#     path('video/link', views.video_link, name='video_link'),
#     # path('video/upload', views.video_upload, name='video_upload'),
#     path('', include(router.urls)),
#     path('manage-contents/', views.manage_contents, name='manage-contents'),
#     path('manage-contents/delete/<int:post_id>', views.delete_post, name='manage-contents-delete'),
#     path('settings/', views.settings, name='creator_settings'),
#     path('apply-for-creator/', views.apply_for_creator, name='apply-for-creator'),
# ]



from django.urls import path, include
from rest_framework import routers
from .views import (
    ReelCloudinaryViewSet,
    VideoCloudinaryViewSet,
    PostAPIViewSet,
    CreatorPostsViewSet,
    ManageContentsViewSet,
    ApplyForCreatorViewSet,
    CreatorAnalyticsView,
)

router = routers.DefaultRouter()

# Reel & Video — now just receive data (uploaded by frontend to Cloudinary)
router.register(r'reel', ReelCloudinaryViewSet, basename='reel')
router.register(r'video', VideoCloudinaryViewSet, basename='video')

# Post CRUD
router.register(r'post', PostAPIViewSet, basename='post')

# Manage creator's own content
router.register(r'manage-contents', ManageContentsViewSet, basename='manage-contents')

# Creator application
router.register(r'apply-for-creator', ApplyForCreatorViewSet, basename='apply-for-creator')

urlpatterns = [
    path('api/', include(router.urls)),

    # Returns all posts created by a specific creator
    # GET  create/api/creator/<user_id>/posts/
    path(
        'api/creator/<int:user_id>/posts/',
        CreatorPostsViewSet.as_view({'get': 'list'}),
        name='creator-posts',
    ),

    # Returns the authenticated creator's own posts
    # GET  create/api/creator/my-posts/
    path(
        'api/creator/my-posts/',
        CreatorPostsViewSet.as_view({'get': 'my_posts'}),
        name='my-creator-posts',
    ),

    # ── Analytics ────────────────────────────────────────────────────────────
    # GET  create/api/analytics/me/            — own stats (auth required)
    path(
        'api/analytics/me/',
        CreatorAnalyticsView.as_view(),
        name='creator-analytics-me',
    ),
    # GET  create/api/analytics/<user_id>/     — any creator's public stats
    path(
        'api/analytics/<int:user_id>/',
        CreatorAnalyticsView.as_view(),
        name='creator-analytics',
    ),
]