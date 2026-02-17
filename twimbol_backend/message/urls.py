from django.urls import path
from . import views


urlpatterns = [
    path('', views.chat, name='message_home'),
    path('<str:username>/', views.chat, name='message_chat'),

]