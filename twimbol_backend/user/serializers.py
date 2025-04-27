from rest_framework import serializers
from .models import *

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


from django.contrib.auth.models import User


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer






class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user']

    def get_user(self, obj):
        
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            
            'first_name': obj.profile.first_name,
            'last_name': obj.profile.last_name,
            'profile_pic': obj.profile.profile_pic.url if obj.profile.profile_pic else None,
            'user_phone': obj.profile.user_phone,
            'user_address': obj.profile.user_address,
            'user_type': obj.profile.user_type,
            'user_social_fb': obj.profile.user_social_fb,
            'user_social_twt': obj.profile.user_social_twt,
            'user_social_yt': obj.profile.user_social_yt,
            'user_status': obj.profile.user_status,
            'user_banned': obj.profile.user_banned,

        }








class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']






<<<<<<< HEAD






=======
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

<<<<<<< HEAD

=======
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
        # Add custom user data to the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            # Add more fields as needed
        }

<<<<<<< HEAD

        return data



=======
        return data
>>>>>>> e358dd667ba7e058e5cea64610cf0bd79c5b451a
