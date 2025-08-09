from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User, Group


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'user']

    def get_user(self, obj):
        profile_pic_url = obj.profile_pic.url if obj.profile_pic else None
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.first_name,
            'last_name': obj.last_name,
            'profile_pic': profile_pic_url,
            'user_phone': obj.user_phone,
            'user_address': obj.user_address,
            'user_type': obj.user_type,
            'user_social_fb': obj.user_social_fb,
            'user_social_twt': obj.user_social_twt,
            'user_social_yt': obj.user_social_yt,
            'user_status': obj.user_status,
            'user_banned': obj.user_banned,
            'user_group': [group.name for group in obj.user.groups.all()]
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']


class UpdateProfileSerializer(serializers.ModelSerializer):
    userId = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['userId', 'first_name', 'last_name', 'profile_pic', 'user_phone', 'user_address', 'user_social_fb', 'user_social_twt', 'user_social_yt']

    def get_userId(self, obj):
        return obj.user.id


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom user data to the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        
        return data




class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    birthday = serializers.DateField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'birthday']

    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        birthday = validated_data.pop('birthday', None)
        
        # Create the user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )

        UserProfile.objects.create(
            user=user, 
            id=user.id, 
            birthday=birthday or '2000-01-01'
        )


        visitor_group, _ = Group.objects.get_or_create(name='visitor')
        user.groups.add(visitor_group)

        return user