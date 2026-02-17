from .models import *
from django import forms
from django.contrib.auth.models import User
from django.forms import ModelForm



class CommentForm(ModelForm):
    class Meta:
        model = Post_Comment
        fields = ['comment', 'created_by']
        widgets = {
            'comment': forms.Textarea(attrs={'placeholder': 'Write a comment...', 'rows': 3, 'cols': 50}),
            'created_by': forms.HiddenInput(),
        }
        labels = {
            'comment': '',
        }





class PostStatLikeForm(ModelForm):
    class Meta:
        model = Post_Stat_like
        fields = ['created_by']
        widgets = {
            'created_by': forms.HiddenInput(),
        }
        labels = {
            'created_by': '',
        }