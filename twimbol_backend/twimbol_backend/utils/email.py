from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User

def send_welcome_email(user_email, user_name):
    """
    Send welcome email to new users
    """
    subject = 'Welcome Aboard! 🎉'
    
    # Context for the email template
    context = {
        'user_name': user_name,
        'user_email': user_email,
        'company_name': 'TWIMBOL',
        'support_email': 'web.rafidabdullahsami@gmail.com',
        'website_url': 'http://rafidabdullahsamiweb.pythonanywhere.com',
    }
    
    # Render HTML email template
    html_message = render_to_string('emails/welcome_email.html', context)
    
    # Create plain text version
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
    





def send_login_email(user_name, login_status):
    subject = "Recent Login Alert"

    user_email = User.objects.get(username=user_name).email

    context = {
        'user_name': user_name,
        'user_email': user_email,
        'company_name': 'TWIMBOL',
        'support_email': 'web.rafidabdullahsami@gmail.com',
        'website_url': 'http://rafidabdullahsamiweb.pythonanywhere.com',
        'time': timezone.now(),
        'login_status': login_status
    }

    html_message = render_to_string('emails/login_email.html', context)
    plain_message = strip_tags(html_message)


    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
            
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
    








def send_pwd_cng_email(user_name, pwd_cng_stt):
    subject = "Password changed"

    user_email = User.objects.get(username=user_name).email

    context = {
        'user_name': user_name,
        'user_email': user_email,
        'company_name': 'TWIMBOL',
        'support_email': 'web.rafidabdullahsami@gmail.com',
        'website_url': 'http://rafidabdullahsamiweb.pythonanywhere.com',
        'time': timezone.now(),
        'pwd': pwd_cng_stt
    }

    html_message = render_to_string('emails/pwd_cng_email.html', context)
    plain_message = strip_tags(html_message)


    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
            
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
    








def pwd_reset_email(email, resetcode):
    subject = "Password Reset Code"


    context = {
        'user_email': email,
        'company_name': 'TWIMBOL',
        'support_email': 'web.rafidabdullahsami@gmail.com',
        'website_url': 'http://rafidabdullahsamiweb.pythonanywhere.com',
        'time': timezone.now(),
    }

    plain_message = strip_tags(f"Dear {email}, your password reset code is: {resetcode}. This code is valid for 10 minutes. If you did not request code, you can ignore this email.")


    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
            
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
    
