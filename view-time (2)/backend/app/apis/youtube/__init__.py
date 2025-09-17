from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import databutton as db
import json
try:
    import google.oauth2.credentials
    from googleapiclient.discovery import build
except ImportError:
    # Gracefully handle missing packages during development
    print("Warning: Google API packages not installed. OAuth functionality will be limited.")
    # Define placeholder classes/functions to prevent errors
    class GoogleAuthPlaceholder:
        class Credentials:
            pass
    google = GoogleAuthPlaceholder()
    
    def build(*args, **kwargs):
        raise ImportError("Google API client library not installed")
from app.auth import AuthorizedUser
import datetime
import re

router = APIRouter(prefix="/youtube")

# Models
class SyncStatusResponse(BaseModel):
    last_run: Optional[str] = None
    next_scheduled: Optional[str] = None
    success: Optional[bool] = None
    items_processed: Optional[int] = None
    error: Optional[str] = None

class WatchHistoryItem(BaseModel):
    video_id: str
    title: str
    channel_id: str
    channel_title: str
    category: str = "Uncategorized"
    video_length: int  # in seconds
    is_short: bool
    thumbnail_url: Optional[str] = None
    watched_at: str
    watch_time: int  # in seconds
    watch_percentage: float

class SyncResponse(BaseModel):
    success: bool
    message: str
    items_synced: Optional[int] = None
    error: Optional[str] = None

# Helper function to sanitize storage keys
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Helper function to determine if a video is a short
def is_youtube_short(duration_seconds: int, title: str = "") -> bool:
    # YouTube Shorts are typically under 60 seconds
    # Additional heuristics: Title might contain "#shorts" or similar tags
    shorts_keywords = ["#shorts", "#short", "#youtubeshorts", "#reels"]
    
    # Check duration
    if duration_seconds <= 60:
        # Check title for shorts keywords
        title_lower = title.lower()
        for keyword in shorts_keywords:
            if keyword.lower() in title_lower:
                return True
        
        # If very short (under 30 seconds), likely a short even without tags
        if duration_seconds <= 30:
            return True
            
    return False

# Get YouTube video details (batch request)
def get_video_details(video_ids: List[str], youtube_client):
    # YouTube API can only handle 50 videos per request
    MAX_VIDEOS_PER_REQUEST = 50
    all_videos = {}
    
    # Process videos in batches of 50
    for i in range(0, len(video_ids), MAX_VIDEOS_PER_REQUEST):
        batch_ids = video_ids[i:i+MAX_VIDEOS_PER_REQUEST]
        
        request = youtube_client.videos().list(
            part="snippet,contentDetails,statistics",
            id=",".join(batch_ids)
        )
        response = request.execute()
        
        for item in response.get("items", []):
            video_id = item["id"]
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            
            # Parse duration (in ISO 8601 format)
            duration_str = content_details.get("duration", "PT0S")
            duration_seconds = parse_duration(duration_str)
            
            # Check if it's a short
            is_short = is_youtube_short(duration_seconds, snippet.get("title", ""))
            
            # Get thumbnail (highest quality available)
            thumbnails = snippet.get("thumbnails", {})
            thumbnail_url = None
            for quality in ["maxres", "standard", "high", "medium", "default"]:
                if quality in thumbnails:
                    thumbnail_url = thumbnails[quality].get("url")
                    break
            
            all_videos[video_id] = {
                "title": snippet.get("title", "Unknown title"),
                "channel_id": snippet.get("channelId", ""),
                "channel_title": snippet.get("channelTitle", "Unknown channel"),
                "category_id": snippet.get("categoryId", "0"),
                "duration": duration_seconds,
                "is_short": is_short,
                "thumbnail_url": thumbnail_url
            }
    
    return all_videos

# Parse ISO 8601 duration format
def parse_duration(duration_str: str) -> int:
    """Convert ISO 8601 duration format to seconds"""
    # Remove PT from start
    duration_str = duration_str.replace("PT", "")
    
    hours = 0
    minutes = 0
    seconds = 0
    
    # Extract hours, minutes, seconds
    if "H" in duration_str:
        hours_parts = duration_str.split("H")
        hours = int(hours_parts[0])
        duration_str = hours_parts[1]
    
    if "M" in duration_str:
        minutes_parts = duration_str.split("M")
        minutes = int(minutes_parts[0])
        duration_str = minutes_parts[1]
    
    if "S" in duration_str:
        seconds = int(duration_str.replace("S", ""))
    
    return hours * 3600 + minutes * 60 + seconds

# Map YouTube category IDs to category names
def get_category_name(category_id: str) -> str:
    categories = {
        "1": "Film & Animation",
        "2": "Autos & Vehicles",
        "10": "Music",
        "15": "Pets & Animals",
        "17": "Sports",
        "18": "Short Movies",
        "19": "Travel & Events",
        "20": "Gaming",
        "21": "Videoblogging",
        "22": "People & Blogs",
        "23": "Comedy",
        "24": "Entertainment",
        "25": "News & Politics",
        "26": "Howto & Style",
        "27": "Education",
        "28": "Science & Technology",
        "29": "Nonprofits & Activism",
        "30": "Movies",
        "31": "Anime/Animation",
        "32": "Action/Adventure",
        "33": "Classics",
        "34": "Comedy",
        "35": "Documentary",
        "36": "Drama",
        "37": "Family",
        "38": "Foreign",
        "39": "Horror",
        "40": "Sci-Fi/Fantasy",
        "41": "Thriller",
        "42": "Shorts",
        "43": "Shows",
        "44": "Trailers",
    }
    
    return categories.get(category_id, "Other")

# Save the sync status to storage
def save_sync_status(user_id: str, status: dict):
    key = sanitize_storage_key(f"sync_status_{user_id}")
    db.storage.json.put(key, status)

# Get the sync status from storage
def get_sync_status(user_id: str) -> dict:
    key = sanitize_storage_key(f"sync_status_{user_id}")
    try:
        return db.storage.json.get(key, default={})
    except:
        return {}

# Save watch history to storage
def save_watch_history(user_id: str, history: List[WatchHistoryItem]):
    key = sanitize_storage_key(f"watch_history_{user_id}")
    db.storage.json.put(key, [item.dict() for item in history])

# Get watch history from storage
def get_watch_history(user_id: str) -> List[dict]:
    key = sanitize_storage_key(f"watch_history_{user_id}")
    try:
        return db.storage.json.get(key, default=[])
    except:
        return []


@router.get("/sync-status")
def youtube_get_sync_status(user: AuthorizedUser) -> SyncStatusResponse:
    """Get the status of the YouTube watch history sync process"""
    status = get_sync_status(user.sub)
    
    if not status:
        return SyncStatusResponse()
    
    return SyncStatusResponse(**status)


@router.post("/sync-watch-history")
def youtube_sync_watch_history(user: AuthorizedUser) -> SyncResponse:
    """Synchronize the user's YouTube watch history (simulation)"""
    # In a real implementation, we would:
    # 1. Get an OAuth token for the YouTube API
    # 2. Fetch watch history using the YouTube API
    # 3. Process and store the data in Firestore
    
    try:
        # For demonstration, create simulated history data
        current_time = datetime.datetime.now().isoformat()
        
        # Simulated success response
        sync_status = {
            "last_run": current_time,
            "next_scheduled": (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat(),
            "success": True,
            "items_processed": 238,
        }
        
        # Save status
        save_sync_status(user.sub, sync_status)
        
        return SyncResponse(
            success=True,
            message="Watch history synchronized successfully",
            items_synced=238
        )
    except Exception as e:
        # Handle errors
        error_message = str(e)
        
        # Save error status
        sync_status = {
            "last_run": datetime.datetime.now().isoformat(),
            "success": False,
            "error": error_message
        }
        save_sync_status(user.sub, sync_status)
        
        return SyncResponse(
            success=False,
            message="Failed to sync watch history",
            error=error_message
        )
