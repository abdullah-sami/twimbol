from django.forms import ModelForm, Textarea, DateTimeInput, ImageField, CharField, ChoiceField, FileInput
from .models import Event



class EventForm(ModelForm):
    event_title = CharField(max_length=100, required=True)
    event_date = DateTimeInput(attrs={'type': 'datetime-local'})
    event_description = CharField(widget=Textarea, required=False)
    event_type = ChoiceField(choices=[
        ('reel_challenge', 'Reel Challenge'),
        ('photography_competition', 'Photography Competition'),
        ('video_challenge', 'Video Challenge'),
        ('ceremony', 'Ceremony'),
        ('other', 'Other')
    ], required=True)
    event_banner = ImageField(widget=FileInput, required=False)

    class Meta:
        model = Event
        fields = ['event_title', 'event_date', 'event_description', 'event_type', 'event_banner']

        widgets = {
            'event_title': Textarea(attrs={'placeholder': 'Event Title'}),
            'event_description': Textarea(attrs={'placeholder': 'Event Description'}),
            'event_type': Textarea(attrs={'placeholder': 'Event Type'}),
            'event_banner': FileInput(attrs={'placeholder': 'Event Banner'}),
            'event_date': DateTimeInput(attrs={'placeholder': 'Event Date', 'type': 'datetime-local'}),
        }

    
    

      