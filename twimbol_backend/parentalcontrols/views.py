# views.py
import random
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.mail import send_mail
from django.conf import settings

from .models import ParentAccount
from .serializers import ParentOTPRequestSerializer, ParentOTPVerifySerializer





class ParentAccountViewSet(viewsets.ViewSet):
    


    @action(detail=False, methods=["post"])
    def request_otp(self, request):
        serializer = ParentOTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            child_id = serializer.validated_data["child_id"]
            parent_email = serializer.validated_data["parent_email"]

            otp = str(random.randint(100000, 999999))

            parent_account, created = ParentAccount.objects.get_or_create(
                child_id=child_id,
                parent_email=parent_email
            )
            parent_account.otp_code = otp
            parent_account.save()


            send_mail(
                subject="Your Twimbool Parent Verification Code",
                message=f"Your OTP code for parent account is: {otp}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[parent_email],
            )

            return Response({"message": "OTP sent to parent email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def verify_otp(self, request):
        serializer = ParentOTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            parent = serializer.save()
            return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
