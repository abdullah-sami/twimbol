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
from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import PermissionDenied  # Import PermissionDenied from Django


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
    
    is_creator =  profile.user.groups.filter(name='creator').exists()
    is_admin = profile.user.groups.filter(name='admin').exists()

    




    # follower check
    if Follower.objects.filter(follower=user, following=profile_user).exists():
        is_following = True
    else:
        is_following = False
    follower_count = Follower.objects.filter(following=profile_user).count()
    following_count = Follower.objects.filter(follower=profile_user).count()


    context = {
        'profile': profile,
        'user': user,
        'posts': posts,
        'message': message,
        'is_creator': is_creator,
        'is_admin': is_admin,
        'follower': {
            'is_following': is_following,
            'follower_count': follower_count,
            'following_count': following_count,},
        
    }
    
    return render(request, 'profile.html', context)








class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow users to view only their own profile
        user = self.request.user
        return UserProfile.objects.filter(user=user)

    def perform_update(self, serializer):
        # Ensure the user cannot update another user's profile
        serializer.save(user=self.request.user)







@visitor_required
def follow(request, profile_user_name):
    user = request.user
    profile_user = User.objects.get(username=profile_user_name)

    if user == profile_user:
        return redirect('profile', profile_user_name=profile_user_name)



    try:
        follower = Follower.objects.get(follower=user, following=profile_user)
        follower.delete()

    except Follower.DoesNotExist:
        Follower.objects.create(follower=user, following=profile_user)

    return redirect('profile', profile_user_name=profile_user_name)






class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get('username')
        if username:
            queryset = queryset.filter(username=username)
        return queryset
    






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
    
    # liked posts
    liked_posts = Post_Stat_like.objects.filter(created_by=user).order_by('-created_at')


    # follower check
    followers = Follower.objects.filter(following=user).order_by('-created_at')
    following = Follower.objects.filter(follower=user).order_by('-created_at')



    context = {
        'message': 'Logged in',
        'user': user,
        'form': user_profile_form,
        'profile': profile,
        'liked_posts': liked_posts,
        'follow': {
            'followers': followers,
            'following': following,  
        },
        }


    return render(request, 'user.html', context)








class UpdateProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow users to access their own profile or restrict access
        return UserProfile.objects.all()

    def perform_update(self, serializer):
        # Ensure the user cannot update another user's profile
        instance = self.get_object()
        if instance.user != self.request.user:
            raise PermissionDenied("You can only update your own profile.")  # Use Django's PermissionDenied
        
        if self.request.FILES.get('profile_pic'):
            profile_pic = self.request.FILES.get('profile_pic')
            serializer.save(user=self.request.user, profile_pic=profile_pic)
        else:
            serializer.save(user=self.request.user)






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







from notifications.models import notifications

class RegisterViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = User.objects.get(username=serializer.validated_data['username'])

            # Create a notification entry
            notifications.objects.create(
                user=User.objects.get(username=data.username),
                message=f"Welcome {user}! Your account has been successfully created.",
                page="profile",  # Example page
                page_item_id=None  # Optional, can be set to a specific ID if needed
            )

            return Response({
                'message': 'User registered successfully.',
                'user': {
                    'id': data.id,
                    'username': data.username,
                    'email': data.email,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)








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




class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



def logout_view(request):
    logout(request)
    return redirect('login')
