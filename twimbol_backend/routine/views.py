# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Course, ClassSchedule, Task, Event
from .serializers import (CourseSerializer, ClassScheduleSerializer, 
                         TaskSerializer, EventSerializer, CalendarDataSerializer)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'code'

class ClassScheduleViewSet(viewsets.ModelViewSet):
    queryset = ClassSchedule.objects.all()
    serializer_class = ClassScheduleSerializer
    
    def get_queryset(self):
        queryset = ClassSchedule.objects.all()
        day = self.request.query_params.get('day', None)
        course = self.request.query_params.get('course', None)
        
        if day is not None:
            queryset = queryset.filter(day=day)
        if course is not None:
            queryset = queryset.filter(course__code=course)
            
        return queryset

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.all()
        date = self.request.query_params.get('date', None)
        course = self.request.query_params.get('course', None)
        completed = self.request.query_params.get('completed', None)
        
        if date is not None:
            queryset = queryset.filter(date=date)
        if course is not None:
            queryset = queryset.filter(course__code=course)
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == 'true')
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        return Response({'completed': task.completed})
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        from datetime import date, timedelta
        
        end_date = date.today() + timedelta(days=30)
        upcoming_tasks = Task.objects.filter(
            date__gte=date.today(),
            date__lte=end_date,
            completed=False
        )
        serializer = self.get_serializer(upcoming_tasks, many=True)
        return Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all()
        date = self.request.query_params.get('date', None)
        type_filter = self.request.query_params.get('type', None)
        
        if date is not None:
            queryset = queryset.filter(date=date)
        if type_filter is not None:
            queryset = queryset.filter(type=type_filter)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        from datetime import date, timedelta
        
        end_date = date.today() + timedelta(days=30)
        upcoming_events = Event.objects.filter(
            date__gte=date.today(),
            date__lte=end_date
        )
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

class CalendarDataViewSet(viewsets.ViewSet):
    """
    ViewSet for bulk operations on calendar data
    """
    
    @action(detail=False, methods=['get'])
    def export_all(self, request):
        """Export all calendar data"""
        data = {
            'courses': CourseSerializer(Course.objects.all(), many=True).data,
            'class_schedule': ClassScheduleSerializer(ClassSchedule.objects.all(), many=True).data,
            'tasks': TaskSerializer(Task.objects.all(), many=True).data,
            'events': EventSerializer(Event.objects.all(), many=True).data,
        }
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def import_all(self, request):
        """Import all calendar data (replaces existing data)"""
        serializer = CalendarDataSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Clear existing data
                    Task.objects.all().delete()
                    Event.objects.all().delete()
                    ClassSchedule.objects.all().delete()
                    Course.objects.all().delete()
                    
                    # Import new data
                    courses_data = serializer.validated_data.get('courses', [])
                    for course_data in courses_data:
                        Course.objects.create(**course_data)
                    
                    schedule_data = serializer.validated_data.get('class_schedule', [])
                    for schedule_item in schedule_data:
                        ClassSchedule.objects.create(**schedule_item)
                    
                    tasks_data = serializer.validated_data.get('tasks', [])
                    for task_data in tasks_data:
                        Task.objects.create(**task_data)
                    
                    events_data = serializer.validated_data.get('events', [])
                    for event_data in events_data:
                        Event.objects.create(**event_data)
                
                return Response({'message': 'Data imported successfully'})
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)