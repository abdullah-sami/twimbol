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
from rest_framework import viewsets, permissions, status, generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *

from rest_framework.response import Response
from django.core.exceptions import PermissionDenied  # Import PermissionDenied from Django
import logging
from twimbol_backend.utils.email import *



class ProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        user = self.request.user
        return UserProfile.objects.filter(user=user)






class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get('username')
        if username:
            queryset = queryset.filter(username=username)
        return queryset









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





class FollowViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        user = request.user
        user_id = request.data.get("user_id")
        try:
            profile_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user == profile_user:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            follower = Follower.objects.get(follower=user, following=profile_user)
            follower.delete()
            action = "unfollowed"
        except Follower.DoesNotExist:
            Follower.objects.create(follower=user, following=profile_user)
            action = "followed"

        return Response({"detail": f"Successfully {action} {profile_user.username}."}, status=status.HTTP_200_OK)




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




class DeactivateProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        profile = request.user.profile
        profile.user_status = False
        profile.save()
        return Response({"detail": "Profile deactivated successfully"}, status=status.HTTP_200_OK)




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








from notifications.models import Notification

logger = logging.getLogger(__name__)


class RegisterViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = User.objects.get(username=serializer.validated_data['username'])

            # Create a notification entry
            Notification.objects.create(
                user=User.objects.get(username=data.username),
                message=f"Welcome {user}! Your account has been successfully created.",
                page="profile",
                page_item_id=None
            )

            # Send welcome email
            email_sent = False
            email_error = None

            try:
                email_sent = send_welcome_email(
                    user_email=data.email,
                    user_name=data.username,
                    # user_id=data.id
                )

                if email_sent:
                    logger.info(f"Welcome email sent successfully to {data.email}")
                else:
                    logger.warning(f"Welcome email failed to send to {data.email}")

            except Exception as e:
                email_error = str(e)
                logger.error(f"Email sending error for {data.email}: {e}")

            # Prepare response
            response_data = {
                'message': 'User registered successfully.',
                'user': {
                    'id': data.id,
                    'username': data.username,
                    'email': data.email,
                },
                'email_sent': email_sent
            }

            # Add email status to response (optional - you might not want to expose this to client)
            if not email_sent:
                response_data['email_note'] = 'Welcome email delivery failed, but registration was successful.'
                if email_error:
                    # Log the error but don't expose it to the client for security
                    logger.error(f"Email error details: {email_error}")

            return Response(response_data, status=status.HTTP_201_CREATED)

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

    def post(self, request, *args, **kwargs):
        client_ip = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        username = request.data.get('username')


        logger.info(f"Login attempt - Username: {username}, IP: {client_ip}, User-Agent: {user_agent[:100]}")

        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            self._process_successful_login(username, client_ip, user_agent, request)
        else:
            self._process_failed_login(username, client_ip, user_agent, request)


        return response

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _process_successful_login(self, username, client_ip, user_agent, request):
        """Process successful login with enhanced logging"""
        try:
            user = User.objects.get(username=username)

            logger.info(f"Successful login - User: {username} (ID: {user.id}), IP: {client_ip}")

            email_sent = send_login_email(username, 'success')

            if email_sent:
                logger.info(f"Login alert sent - User: {username}, Email: {user.email}")
            else:
                logger.warning(f"Failed to send login alert - User: {username}")

        except User.DoesNotExist:
            logger.error(f"User not found after authentication: {username}")
        except Exception as e:
            logger.error(f"Error processing login for {username}: {str(e)}")


    def _process_failed_login(self, username, client_ip, user_agent, request):
        """Process successful login with enhanced logging"""
        try:
            user = User.objects.get(username=username)

            logger.info(f"Successful login - User: {username} (ID: {user.id}), IP: {client_ip}")

            email_sent = send_login_email(username, 'failed')

            if email_sent:
                logger.info(f"Login alert sent - User: {username}, Email: {user.email}")
            else:
                logger.warning(f"Failed to send login alert - User: {username}")

        except User.DoesNotExist:
            logger.error(f"User not found after authentication: {username}")
        except Exception as e:
            logger.error(f"Error processing login for {username}: {str(e)}")




def logout_view(request):
    logout(request)
    return redirect('login')













class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]},
                                status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            send_pwd_cng_email(user.username, 'success')

            return Response({"detail": "Password updated successfully"},
                            status=status.HTTP_200_OK)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)











import random
from django.core.mail import send_mail
from django.utils.timezone import now, timedelta


class RequestPasswordResetView(generics.GenericAPIView):
    serializer_class = RequestPasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        # generate 6-digit code
        code = str(random.randint(100000, 999999))

        # save code
        PasswordResetCode.objects.create(user=user, code=code)

        # send email
        pwd_reset_email(email, code)

        return Response({"detail": "Password reset code sent to email."}, status=status.HTTP_200_OK)







class ResetPasswordConfirmView(generics.GenericAPIView):
    serializer_class = ResetPasswordConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST)

        # check code
        try:
            reset_entry = PasswordResetCode.objects.filter(user=user, code=code).latest('created_at')
        except PasswordResetCode.DoesNotExist:
            return Response({"detail": "Invalid or expired reset code."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Expiry check (10 min)
        if reset_entry.created_at < now() - timedelta(minutes=10):
            return Response({"detail": "Reset code expired."}, status=status.HTTP_400_BAD_REQUEST)

        # reset password
        user.set_password(new_password)
        user.save()

        # delete all codes for this user
        PasswordResetCode.objects.filter(user=user).delete()

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)








class DeleteAccountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_200_OK)