from django.shortcuts import render, redirect
from .models import *
from app.models import *
from .forms import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm



def profile(request, profile_user_name):

    user = request.user
    profile = UserProfile.objects.get(user__username=profile_user_name)

    posts = Post.objects.filter(created_by=profile.user).order_by('-created_at')

    if request.method == 'GET':
        q = request.GET.get('q')
        
        posts = posts.filter(post_type=q)

    if user == profile.user:
        return redirect('user_manager')
    

    context = {
        'profile': profile,
        'user': user,
        'posts': posts
        }

    return render(request, 'profile.html', context)



def user_manager(request):


    if request.user.is_authenticated:
        user = request.user
        profile = user.profile
        

        if(user.profile):
            if request.method == 'POST':
                user_profile_form = UserProfileForm(request.POST, instance=profile)
                if user_profile_form.is_valid():
                    user_profile_form.save()
                    return redirect('user_manager')
            else:
                user_profile_form = UserProfileForm(instance=profile)
        else:
            UserProfile.objects.create(
                user=User.objects.get(username=user.username),
            )


        context = {
            'message': 'Logged in',
            'user': user,
            'form': user_profile_form,
            'profile': profile
            }
    else:
        return redirect('login')

        



    return render(request, 'user.html', context)





def register_view(request):

    if request.user.is_authenticated:
        return redirect('user_manager')

    if request.method == 'POST':
        register_form = UserCreateForm(request.POST)
        if register_form.is_valid():
            register_form.save()

            UserProfile.objects.create(
                user=User.objects.get(username=register_form.cleaned_data['username']),
            )
            return redirect('login')
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
