from rest_framework import serializers
from .models import *


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer






class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'








class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']












class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)


        # Add custom user data to the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            # Add more fields as needed
        }


        return data



