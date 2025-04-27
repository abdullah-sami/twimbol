
import os, json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyD76SNAaSjja69pe4Qfpcwlp8Y8BRuUkqQ")

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)



def get_youtube_credentials():
    creds_file = 'youtube_credentials.json'

    if not os.path.exists(creds_file):
        raise Exception("YouTube credentials file not found.")

    with open(creds_file, 'r') as f:
        creds_data = json.load(f)

    credentials = Credentials.from_authorized_user_info(info=creds_data)

    # Important: Refresh and bind request BEFORE returning
    if credentials and credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        # Save updated token
        with open(creds_file, 'w') as f:
            f.write(credentials.to_json())

    return credentials



def upload_to_youtube(video_path, title, description):
    credentials = get_youtube_credentials()

    youtube = build('youtube', 'v3', credentials=credentials)

    body = {
        'snippet': {
            'title': title,
            'description': description,
            'categoryId': '22',  # People & Blogs
        },
        'status': {
            'privacyStatus': 'public'
        }
    }

    media = MediaFileUpload(video_path, mimetype='video/*', resumable=True)
    request = youtube.videos().insert(part='snippet,status', body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        print("Uploading..." if status else "Upload complete.")

    return response







def get_video_data(video_id):
    
    # Get video details
    video_response = youtube.videos().list(
        part='snippet,statistics',
        id=video_id
    ).execute()
    
    if not video_response['items']:
        return None
    
    video_data = video_response['items'][0]
    snippet = video_data['snippet']
    statistics = video_data['statistics']
    
    # Get channel details (for channel image)
    channel_response = youtube.channels().list(
        part='snippet',
        id=snippet['channelId']
    ).execute()
    
    channel_data = channel_response['items'][0]
    channel_image = channel_data['snippet']['thumbnails']['default']['url']
    
    return {
        'video_id': video_id,
        'title': snippet['title'],
        'description': snippet['description'],
        'thumbnail_url': snippet['thumbnails']['high']['url'],
        'channel_title': snippet['channelTitle'],
        'channel_image_url': channel_image,
        'view_count': statistics.get('viewCount', 0),
        'like_count': statistics.get('likeCount', 0)
    }









def get_video_stats(video_id):
    
    # Get video details
    video_response = youtube.videos().list(
        part='snippet,statistics',
        id=video_id
    ).execute()
    
    if not video_response['items']:
        return None
    
    video_data = video_response['items'][0]
    snippet = video_data['snippet']
    statistics = video_data['statistics']
    
    return {
        'video_id': video_id,
        'view_count': statistics.get('viewCount', 0),
        'like_count': statistics.get('likeCount', 0)
    }