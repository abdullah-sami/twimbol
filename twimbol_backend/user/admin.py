from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(CreatorApplication)
admin.site.register(Follower)
admin.site.register(Block)