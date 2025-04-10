from django.shortcuts import render, redirect
from django.http import HttpResponse
from user.models import CreatorApplication
from user.decorators import admin_required

from app.models import *
from django.contrib.auth.models import User, Group
# Create your views here.


@admin_required
def admin_home(request):

    users = User.objects.all().order_by('-date_joined')



    context = {
        'page': 'home',
        'users': users,
    }
    
    return render(request, 'admin.html', context)
    





@admin_required
def creators(request):
    creators = User.objects.filter(groups__name="creator").order_by('username')

    new_applications = CreatorApplication.objects.filter(application_status=0).order_by('created_at')

    if request.method == 'POST':
        creator_application_action = request.POST.get('creator_application')
        # print(creator_application_action)
        if creator_application_action == '1':
            creator = User.objects.get(username=request.POST.get('applicant_username'))
            creator.groups.remove(Group.objects.get(name='visitor'))
            creator.groups.add(Group.objects.get(name='creator'))
            creator.save()

            creator_application = CreatorApplication.objects.get(user=creator)
            creator_application.application_status = 1
            creator_application.save()
            return redirect('admin_creators')
        elif creator_application_action == '0':
            creator = User.objects.get(username=request.POST.get('applicant_username'))

            creator_application = CreatorApplication.objects.get(user=creator)
            creator_application.delete()
            return redirect('admin_creators')
    
    context = {
        'page': 'creators',
        'users': creators,
        'new_applications': new_applications,
    }
    
    return render(request, 'admin.html', context)






def users(request):
    users = User.objects.filter(groups__name="visitor").order_by('username')


    
    context = {
        'page': 'users',
        'users': users,
    }
    
    return render(request, 'admin.html', context)


def admins(request):
    admins = User.objects.filter(groups__name="admin").order_by('username')


    
    context = {
        'page': 'admins',
        'users': admins,
    }
    
    return render(request, 'admin.html', context)

def banned(request):
    banned = User.objects.filter(profile__user_banned=True).order_by('username')


    
    context = {
        'page': 'banned',
        'users': banned,
    }
    
    return render(request, 'admin.html', context)