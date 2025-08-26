from rest_framework import serializers
from .models import Course, ClassSchedule, Task, Event

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'created_at']

class ClassScheduleSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    
    class Meta:
        model = ClassSchedule
        fields = ['id', 'course', 'course_code', 'course_title', 'day', 'day_display', 
                 'time', 'room', 'teacher', 'notes', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'type', 'type_display', 'course', 'course_code', 
                 'course_title', 'date', 'description', 'completed', 'created_at', 'updated_at']

class EventSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'type', 'type_display', 'date', 'description', 
                 'created_at', 'updated_at']

# Bulk serializers for import/export
class CalendarDataSerializer(serializers.Serializer):
    courses = CourseSerializer(many=True)
    class_schedule = ClassScheduleSerializer(many=True)
    tasks = TaskSerializer(many=True)
    events = EventSerializer(many=True)