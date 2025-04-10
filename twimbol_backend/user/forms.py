from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, PasswordChangeForm
from django.forms import ModelForm
from .models import *
from django.forms import TextInput


class UserCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].help_text = None
        self.fields['email'].required = True
        self.fields['password1'].help_text = """
        <li>Password must be 8 characters or longer</li>
        <li>Do not use common password</li>
        """
        self.fields['password2'].help_text = "Confirm Password"

    

    




class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'user_phone', 'user_address', 'user_social_fb', 'user_social_twt', 'user_social_yt']
        widgets = {
            'user_phone': TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone Number', 'type': 'tel'}),
            'user_address': TextInput(attrs={'class': 'form-control', 'placeholder': 'Address', 'type': 'address'}),
            'user_social_fb': TextInput(attrs={'class': 'form-control', 'placeholder': 'Facebook Link'}),
            'user_social_twt': TextInput(attrs={'class': 'form-control', 'placeholder': 'Twitter Link'}),
            'user_social_yt': TextInput(attrs={'class': 'form-control', 'placeholder': 'YouTube Link'}),
        }




class CreatorApprovalForm(ModelForm):
    class Meta:
        model = CreatorApplication
        fields = ['application_status']


class CreatorApplicationForm(ModelForm):
    class Meta:
        model = CreatorApplication
        fields = ['user'] 