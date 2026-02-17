# views.py
from google.auth.transport.requests import Request
from django.shortcuts import redirect, render
from google_auth_oauthlib.flow import Flow
import os

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Dev only

def youtube(request):
    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=['https://www.googleapis.com/auth/youtube.upload'],
        redirect_uri='http://127.0.0.1:8000/authorize/callback'
    )
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
        )

    return redirect(auth_url)





def oauth2callback(request):
    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=['https://www.googleapis.com/auth/youtube.upload'],
        redirect_uri='http://127.0.0.1:8000/authorize/callback'
    )
    flow.fetch_token(authorization_response=request.build_absolute_uri())

    credentials = flow.credentials
    with open('youtube_credentials.json', 'w') as token:
        token.write(credentials.to_json())
        
    return redirect('home')


