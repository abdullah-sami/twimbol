from django.db import models
from django.utils import timezone

class Course(models.Model):
    code = models.CharField(max_length=10, unique=True)  # e.g., "ACC2203"
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.code} - {self.title}"

class ClassSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Sunday'),
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    day = models.IntegerField(choices=DAY_CHOICES)
    time = models.CharField(max_length=50)
    room = models.CharField(max_length=20)
    teacher = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['day', 'time']
    
    def __str__(self):
        return f"{self.course.code} - {self.get_day_display()} {self.time}"

class Task(models.Model):
    TASK_TYPES = [
        ('test', 'Class Test'),
        ('assignment', 'Assignment'),
        ('term_paper', 'Term Paper'),
        ('presentation', 'Presentation'),
        ('exam', 'Exam'),
    ]
    
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TASK_TYPES)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'created_at']
    
    def __str__(self):
        return f"{self.title} ({self.course.code})"

class Event(models.Model):
    EVENT_TYPES = [
        ('holiday', 'Holiday'),
        ('event', 'General Event'),
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
    ]
    
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'created_at']
    
    def __str__(self):
        return f"{self.title} - {self.date}"