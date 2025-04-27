from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='events'),
    path('create/', views.create_event, name='create_event'),
    path('<int:event_id>/', views.event_details, name='event_details'),
    path('edit/<int:event_id>/', views.edit_event, name='event_edit'),

    path('events/my_events/', views.home, name='my_events'),


    path('<int:event_id>/post/', views.event_post, name='event_post'),

    path('<int:event_id>/delete/', views.delete_event, name='event_delete'),
] 
