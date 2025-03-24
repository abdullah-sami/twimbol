from django import forms
from .models import *



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


        

