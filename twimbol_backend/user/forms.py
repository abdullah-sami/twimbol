from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, PasswordChangeForm
from django.forms import ModelForm
from .models import *



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
        fields = ['first_name', 'last_name', 'user_phone', 'user_address']