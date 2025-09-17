from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
import requests
import databutton as db
import json
from datetime import datetime, timedelta
from app.auth import AuthorizedUser

router = APIRouter(prefix="/yt-sync")

class SyncStatusResponse(BaseModel):
    last_synced: str | None
    total_videos: int
    is_syncing: bool

class SyncRequest(BaseModel):
    access_token: str

@router.post("/sync-watch-history")
async def sync_watch_history(request: SyncRequest, user: AuthorizedUser):
    """
    Sync a user's YouTube watch history using their OAuth access token
    """
    try:
        # Save the current sync status
        sync_status = json.dumps({
            "is_syncing": True,
            "started_at": datetime.now().isoformat(),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        
        # Call the YouTube API to get watch history
        headers = {
            "Authorization": f"Bearer {request.access_token}",
            "Accept": "application/json"
        }
        
        # Get watch history from YouTube API
        response = requests.get(
            "https://www.googleapis.com/youtube/v3/history",
            headers=headers,
            params={
                "part": "snippet,contentDetails",
                "maxResults": 50  # Maximum allowed by the API
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch watch history: {response.text}"
            )
            
        data = response.json()
        items = data.get("items", [])
        
        # Process and store watch history
        processed_data = []
        for item in items:
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            
            # Extract video details
            video_id = content_details.get("videoId")
            if not video_id:
                continue  # Skip non-video items
                
            channel_id = snippet.get("channelId")
            channel_title = snippet.get("channelTitle")
            title = snippet.get("title")
            # These fields are extracted but not used yet - keeping for future features
            # published_at = snippet.get("publishedAt")
            # description = snippet.get("description")
            thumbnails = snippet.get("thumbnails", {})
            
            # Get video duration and category
            video_response = requests.get(
                "https://www.googleapis.com/youtube/v3/videos",
                headers=headers,
                params={
                    "part": "contentDetails,snippet",
                    "id": video_id
                }
            )
            
            if video_response.status_code == 200:
                video_data = video_response.json()
                video_items = video_data.get("items", [])
                
                if video_items:
                    video_item = video_items[0]
                    content_details = video_item.get("contentDetails", {})
                    duration_str = content_details.get("duration", "PT0S")  # ISO 8601 duration
                    
                    # Parse ISO 8601 duration
                    # This is a simplified version and doesn't handle all cases
                    duration_seconds = 0
                    if "H" in duration_str:
                        h_index = duration_str.find("H")
                        hours = int(duration_str[duration_str.find("PT") + 2:h_index])
                        duration_seconds += hours * 3600
                        duration_str = duration_str[h_index + 1:]
                    
                    if "M" in duration_str:
                        m_index = duration_str.find("M")
                        minutes = int(duration_str[duration_str.find("T") + 1 if "T" in duration_str else 0:m_index])
                        duration_seconds += minutes * 60
                        duration_str = duration_str[m_index + 1:]
                    
                    if "S" in duration_str:
                        s_index = duration_str.find("S")
                        seconds = int(duration_str[:s_index])
                        duration_seconds += seconds
                    
                    # Check if this is a YouTube Short
                    is_short = duration_seconds <= 60
                    
                    # Get video category
                    snippet = video_item.get("snippet", {})
                    category_id = snippet.get("categoryId", "22")  # Default to 'People & Blogs'
                    
                    # Map category ID to name (simplified version)
                    category_map = {
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
                        "29": "Nonprofit & Activism",
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
                        "44": "Trailers"
                    }
                    
                    category = category_map.get(category_id, "Other")
                    
                    # Get thumbnail URL
                    thumbnail_url = None
                    if thumbnails:
                        if "maxres" in thumbnails:
                            thumbnail_url = thumbnails["maxres"].get("url")
                        elif "high" in thumbnails:
                            thumbnail_url = thumbnails["high"].get("url")
                        elif "medium" in thumbnails:
                            thumbnail_url = thumbnails["medium"].get("url")
                        elif "default" in thumbnails:
                            thumbnail_url = thumbnails["default"].get("url")
                    
                    # Create video data object
                    video_data = {
                        "id": video_id,
                        "userId": user.sub,
                        "title": title,
                        "channelId": channel_id,
                        "channelTitle": channel_title,
                        "category": category,
                        "videoLength": duration_seconds,
                        "watchCount": 1,  # Initial watch count
                        "totalWatchTime": duration_seconds,  # Estimate, actual watch time unknown
                        "watchThroughPercentage": 100,  # Estimate, actual percentage unknown
                        "isShort": is_short,
                        "thumbnailUrl": thumbnail_url,
                        "lastWatched": datetime.now().isoformat(),
                        "firstWatched": datetime.now().isoformat()
                    }
                    
                    processed_data.append(video_data)
        
        # Store the processed data
        watch_history_key = f"watch_history_{user.sub}"
        
        # Check if we already have data for this user
        try:
            existing_data = db.storage.json.get(watch_history_key)
            # Merge with existing data, updating where needed
            video_dict = {item["id"]: item for item in existing_data}
            
            for video in processed_data:
                if video["id"] in video_dict:
                    # Update existing video data
                    existing = video_dict[video["id"]]
                    existing["watchCount"] += 1
                    existing["totalWatchTime"] += video["videoLength"]  # Estimate
                    existing["lastWatched"] = video["lastWatched"]
                else:
                    # Add new video
                    video_dict[video["id"]] = video
            
            # Convert back to list
            updated_data = list(video_dict.values())
        except Exception:
            # No existing data, use processed data as is
            updated_data = processed_data
        
        # Save the data
        db.storage.json.put(watch_history_key, updated_data)
        
        # Update sync status
        sync_status = json.dumps({
            "is_syncing": False,
            "last_synced": datetime.now().isoformat(),
            "total_videos": len(updated_data),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        
        return {"success": True, "videos_synced": len(processed_data), "total_videos": len(updated_data)}
        
    except HTTPException as e:
        # Propagate HTTP exceptions (already formatted)
        # Update sync status with error
        sync_status = json.dumps({
            "is_syncing": False,
            "error": e.detail,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        raise
    except requests.RequestException as e:
        # Handle network or API-specific errors
        error_msg = f"YouTube API request failed: {str(e)}"
        sync_status = json.dumps({
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg
        ) from e
    except ValueError as e:
        # Handle validation errors
        error_msg = f"Invalid data: {str(e)}"
        sync_status = json.dumps({
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        ) from e
    except Exception as e:
        # Catch-all for unexpected errors
        error_msg = f"Failed to sync watch history: {str(e)}"
        sync_status = json.dumps({
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub
        })
        db.storage.text.put(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        ) from e

@router.get("/sync-status")
async def get_sync_status(user: AuthorizedUser) -> SyncStatusResponse:
    """
    Get the current sync status for a user
    """
    try:
        # Get the sync status
        sync_status_key = f"sync_status_{user.sub}"
        sync_status_str = db.storage.text.get(sync_status_key, default="{}")
        sync_status = json.loads(sync_status_str)
        
        # Get video count
        watch_history_key = f"watch_history_{user.sub}"
        try:
            watch_history = db.storage.json.get(watch_history_key)
            total_videos = len(watch_history)
        except Exception:
            total_videos = 0
        
        return SyncStatusResponse(
            last_synced=sync_status.get("last_synced"),
            total_videos=total_videos,
            is_syncing=sync_status.get("is_syncing", False)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sync status: {str(e)}"
        ) from e
