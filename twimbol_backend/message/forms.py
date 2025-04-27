from django.forms import ModelForm
from .models import *
from django.forms.widgets import Textarea, FileInput

class MessageForm(ModelForm):
    class Meta:
        model = Message
        fields = ['content', 'media']

        widgets = {
            'content': Textarea(attrs={'placeholder': 'Type your message here...'}),
            'media': FileInput(attrs={'accept': 'image/*,video/*,audio/*'}),
        }

    
