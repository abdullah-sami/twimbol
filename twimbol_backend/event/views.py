from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import *
from .models import *
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from user.decorators import admin_required, visitor_required, creator_required
from django.db.models import Q


# Create your views here.
def home(request):
    user = request.user

    if 'my_events' in request.path:
        events = Event.objects.filter(
            Q(participants=user) | Q(created_by=user)
            ).order_by('-created_at')
        
    else:
        events = Event.objects.all().order_by('-created_at')

    context = {
        'page': 'event_home',
        'events': events,
    }


    return render(request, 'events.html', context)




def create_event(request):

    user = request.user

    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save(commit=False)
            event.created_by = user
            
            if request.FILES.get('event_banner'):
                uploaded_file = request.FILES.get('event_banner')
                uploaded_file.name = f'img/event_banners/{uploaded_file.name}'
                event.event_banner = uploaded_file
            
            event.save()
            return redirect('events')
        else:
            return redirect('events')
    else:
        form = EventForm()


    context = {
        'page': 'create_event',
        'form': form,
    }

    return render(request, 'events.html', context)



def edit_event(request, event_id):
    
    user = request.user

    event = Event.objects.get(id=event_id)

    if event.created_by != user:
        return redirect('event_details', event_id)

    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES, instance=event)
        if form.is_valid():
            event = form.save(commit=False)
            event.created_by = user
            
            if request.FILES.get('event_banner'):
                event.event_banner = request.FILES['event_banner']
            
            event.save()
            return redirect('events')
        else:
            return redirect('events')
    else:
        form = EventForm(instance=event)


    context = {
        'page': 'event_edit',
        'form': form,
        'event': event,
    }

    return render(request, 'events.html', context)



def delete_event(request, event_id):
    user = request.user

    print(user)

    event = Event.objects.get(id=event_id, created_by=user)
    if not event:
        return redirect('events')

    else:
        event.delete()
        return redirect('events')
    


def event_details(request, event_id):
    user  = request.user

    event = Event.objects.get(id=event_id)

    posts = Post.objects.filter(event_post__id=event_id).order_by('-created_at')


    participants = event.participants.all()

    is_creator =  user.groups.filter(name='creator').exists()
    is_admin = user.groups.filter(name='admin').exists()



    context = {
        'page': 'event_details',
        'event': event,
        'posts': posts,
        'participants': participants,
        'is_creator': is_creator,
        'is_admin': is_admin,
    }

    return render(request, 'events.html', context)
    






def event_post(request, event_id):
    user = request.user

    event = Event.objects.get(id=event_id)

    context = {
        'page': 'event_post',
        'event': event,
    }
    

    return render(request, 'events.html', context)