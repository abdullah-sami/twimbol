from django.shortcuts import render
from .models import *
from .forms import *
from user.models import Follower
from django.contrib.auth.decorators import login_required





@login_required
def chat(request, username=None):
    user = request.user
    
    if username is None:
        chats = User.objects.filter(sent_messages__receiver=user).distinct() | User.objects.filter(received_messages__sender=user).distinct()
        chats = chats.distinct()
        
        
        return render(request, 'messages.html', {'chats': chats})
    


    chat_user = User.objects.get(username=username)

    messages = Message.objects.filter(sender=user, receiver=chat_user) | Message.objects.filter(sender=chat_user, receiver=user)
    messages = messages.order_by('-timestamp')

    form = MessageForm(request.POST, request.FILES)

    if request.method == 'POST':
        form = MessageForm(request.POST, request.FILES)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = user
            message.receiver = chat_user
            message.save()
            form = MessageForm()
            


    context = {
        'messages': messages,
        'chat_user': chat_user,
        'form': form,
    }

    return render(request, 'messages.html', context)