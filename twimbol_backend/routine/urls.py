from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, ClassScheduleViewSet, TaskViewSet, EventViewSet, CalendarDataViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'schedule', ClassScheduleViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'events', EventViewSet)
router.register(r'data', CalendarDataViewSet, basename='calendar-data')

urlpatterns = [
    path('api/', include(router.urls)),
]
