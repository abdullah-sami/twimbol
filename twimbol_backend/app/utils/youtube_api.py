
from googleapiclient.discovery import build
import os

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "AIzaSyD76SNAaSjja69pe4Qfpcwlp8Y8BRuUkqQ")

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


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
        'thumbnail_url': snippet['thumbnails']['high']['url'],
        'channel_title': snippet['channelTitle'],
        'channel_image_url': channel_image,
        'view_count': statistics.get('viewCount', 0),
        'like_count': statistics.get('likeCount', 0)
    }