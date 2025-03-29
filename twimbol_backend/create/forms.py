from django import forms
from app.models import *



class Youtube_Video_Id_Title_Form(forms.ModelForm):
    class Meta:
        model = Youtube_Video_Id_Title
        fields = ['video_id']
        widgets = {
            'video_id': forms.TextInput(attrs={'class': 'yt-vid-id-ttl-form-control', 'id': 'yt-form-control-video-id'}),
        }


        


class Youtube_Reel_Id_Form(forms.ModelForm):
    class Meta:
        model = Youtube_Reels_Id
        fields = ['reel_id']
        widgets = {
            'reel_id': forms.TextInput(attrs={'class': 'yt-vid-id-ttl-form-control', 'id': 'yt-form-control-video-id'}),
        }


        
        





class PostForm(forms.ModelForm):
    
    class Meta:
        model = Post
        fields = ['post_type', 'post_title', 'post_description', 'post_banner']
        widgets = {
            'post_type': forms.HiddenInput(attrs={'class': 'post_form_controls', 'id': 'post_form_type', 'value': 'post'}),
            'post_title': forms.TextInput(attrs={'class': 'post_form_controls', 'id': 'post_form_title'}),
            'post_description': forms.Textarea(attrs={'class': 'post_form_controls', 'id': 'post_form_description'}),
            'post_banner': forms.FileInput(attrs={'class': 'post_form_controls', 'id': 'post_form_banner'}),
        }
    def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.fields['post_description'].required = False
            self.fields['post_banner'].required = False