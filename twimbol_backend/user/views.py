from django.shortcuts import render, redirect
from .models import *
from app.models import *
from .forms import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import Group, User
from .decorators import admin_required, creator_required, visitor_required
from django.urls import reverse
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required



@visitor_required
def profile(request, profile_user_name):
    user = request.user

    try:
        profile_user = User.objects.get(username=profile_user_name)
        profile = UserProfile.objects.get(user=profile_user)
        message = 'User Found'
    except User.DoesNotExist:
        profile_user = None
        profile = None
        message = 'No such user.'

    posts = Post.objects.filter(created_by=profile_user).order_by('-created_at')
    

    if request.method == 'GET':
        if request.GET.get('q'):
            q = request.GET.get('q')
        
            posts = posts.filter(post_type=q)

    if user == profile_user:
        return redirect('user_manager')
    
    if request.user.groups.filter(name='admin').exists():
        user.is_admin = True

    context = {
        'profile': profile,
        'user': user,
        'posts': posts,
        'message': message,
        }

    return render(request, 'profile.html', context)


@login_required
def user_manager(request):


    user = request.user
    profile = user.profile
    

    if(user.profile):
        if request.method == 'POST':
            user_profile_form = UserProfileForm(request.POST, request.FILES, instance=profile)
            if user_profile_form.is_valid():
                user_profile_form.save()
                if request.FILES.get('profile_pic'):
                    uploaded_file = request.FILES.get('profile_pic')
                    uploaded_file.name = f'img/profile_pics/{uploaded_file.name}'

                    profile.profile_pic = uploaded_file
                

                return redirect('user_manager')
        else:
            user_profile_form = UserProfileForm(instance=profile)
    else:
        UserProfile.objects.create(
            user=User.objects.get(username=user.username),
        )

    if request.method == 'POST' and 'delete_profile' in request.POST:
        user.delete()
        return redirect('login')
    

    liked_posts = Post_Stat_like.objects.filter(created_by=user).order_by('-created_at')



    context = {
        'message': 'Logged in',
        'user': user,
        'form': user_profile_form,
        'profile': profile,
        'liked_posts': liked_posts,
        }


    return render(request, 'user.html', context)





def register_view(request):

    if request.user.is_authenticated:
        return redirect('user_manager')

    if request.method == 'POST':
        register_form = UserCreateForm(request.POST)
        if register_form.is_valid():
            user = register_form.save()

            UserProfile.objects.create(
                user=User.objects.get(username=register_form.cleaned_data['username']),
            )
            group = Group.objects.get(name='visitor')
            user.groups.add(group)
            return redirect(reverse('login') + '?new_user=True')
    else:
        register_form = UserCreateForm()

    context = {
        'message': 'Please register to view this page.',
        'form': register_form
        }

    return render(request, 'login.html', context)





def login_view(request):

    


    if request.user.is_authenticated:
        return redirect('user_manager')

    if request.method == 'POST':
        login_form = AuthenticationForm(data=request.POST)
        if login_form.is_valid():
            user = login_form.get_user()
            login(request, user)
            
            return redirect('home')
    else:
        login_form = AuthenticationForm()


    context = {
        'message': 'login',
        'form': login_form
        }
    
    return render(request, 'login.html', context)







def logout_view(request):
    logout(request)
    return redirect('login')
