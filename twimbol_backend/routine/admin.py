from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Course)
admin.site.register(ClassSchedule)
admin.site.register(Task)
admin.site.register(Event)