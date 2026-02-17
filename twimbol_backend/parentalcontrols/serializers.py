# serializers.py
from rest_framework import serializers
from .models import ParentAccount
from django.contrib.auth.models import User

class ParentOTPRequestSerializer(serializers.Serializer):
    child_id = serializers.IntegerField()
    parent_email = serializers.EmailField()

    def validate(self, data):
        child_id = data.get("child_id")
        parent_email = data.get("parent_email")

        if not User.objects.filter(id=child_id).exists():
            raise serializers.ValidationError("Child user not found.")

        if ParentAccount.objects.filter(parent_email=parent_email).exists():
            raise serializers.ValidationError("This parent email is already linked.")

        return data







class ParentOTPVerifySerializer(serializers.Serializer):
    child_id = serializers.IntegerField()
    parent_email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        child_id = data.get("child_id")
        parent_email = data.get("parent_email")
        otp_code = data.get("otp_code")

        try:
            parent = ParentAccount.objects.get(child_id=child_id, parent_email=parent_email)
        except ParentAccount.DoesNotExist:
            raise serializers.ValidationError("Parent account not found.")

        if parent.otp_code != otp_code:
            raise serializers.ValidationError("Invalid OTP.")

        return data

    def save(self, **kwargs):
        parent = ParentAccount.objects.get(
            child_id=self.validated_data["child_id"],
            parent_email=self.validated_data["parent_email"]
        )
        parent.otp_verified = True
        parent.otp_code = None  # clear OTP
        parent.save()
        return parent
