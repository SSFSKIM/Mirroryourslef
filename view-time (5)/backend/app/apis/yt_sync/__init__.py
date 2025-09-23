from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
import requests
from app.libs import kv_store
import json
from datetime import datetime, timedelta
from app.auth import AuthorizedUser
from app.libs.liked_videos_manager import LikedVideosAnalyticsManager

router = APIRouter(prefix="/yt-sync")

# Initialize the analytics manager
analytics_manager = LikedVideosAnalyticsManager()

class SyncStatusResponse(BaseModel):
    last_synced: str | None
    total_videos: int
    is_syncing: bool
    sample_size: int = 100
    analytics_available: bool = False

class SyncRequest(BaseModel):
    access_token: str
    sample_size: int = 100  # 50, 100, 150, 200, or 250

class AnalyticsResponse(BaseModel):
    success: bool
    analytics: dict | None
    sample_size: int
    analysis_date: str | None
    data_completeness_score: float = 0.0

@router.post("/sync-liked-videos")
async def sync_liked_videos(request: SyncRequest, user: AuthorizedUser):
    """
    Sync a user's YouTube liked videos using their OAuth access token
    """
    try:
        # Validate access token is provided
        if not request.access_token or request.access_token.strip() == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access token is required. Please authenticate with YouTube first."
            )
        
        # Validate sample size
        sample_size = analytics_manager.validate_sample_size(request.sample_size)

        # Persist the user's preferred sample size so future analytics requests stay in sync
        try:
            await analytics_manager.storage.store_user_preferences(user.sub, {
                "preferred_sample_size": sample_size
            })
        except Exception as pref_error:
            # Preferences failing to persist should not block the sync flow, but log for visibility
            print(f"Warning: failed to store preferred sample size for {user.sub}: {pref_error}")
        
        # Save the current sync status
        await analytics_manager.update_sync_status(user.sub, {
            "is_syncing": True,
            "sync_in_progress": True,
            "last_sync_attempt": datetime.now().isoformat(),
            "preferred_sample_size": sample_size
        })
        
        # Call the YouTube API to get liked videos
        headers = {
            "Authorization": f"Bearer {request.access_token}",
            "Accept": "application/json"
        }
        
        # Get liked videos from YouTube API using the 'likes' playlist
        # First, get the user's 'likes' playlist ID
        channels_response = requests.get(
            "https://www.googleapis.com/youtube/v3/channels",
            headers=headers,
            params={
                "part": "contentDetails",
                "mine": "true"
            }
        )
        
        if channels_response.status_code == 401:
            error_msg = "YouTube authentication failed. Please re-authenticate with Google and ensure you have granted YouTube access permissions."
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "last_error": error_msg
            })
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_msg
            )
        elif channels_response.status_code == 403:
            error_msg = "YouTube API access forbidden. Please check your Google account permissions and ensure YouTube Data API is enabled."
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "last_error": error_msg
            })
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_msg
            )
        elif channels_response.status_code != 200:
            # Try to parse the YouTube API error response
            try:
                error_data = channels_response.json()
                youtube_error = error_data.get("error", {})
                error_message = youtube_error.get("message", "Unknown YouTube API error")
                error_msg = f"YouTube API error: {error_message}"
            except:
                error_msg = f"Failed to fetch user channel: HTTP {channels_response.status_code}"
            
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "last_error": error_msg
            })
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
            
        channel_data = channels_response.json()
        channel_items = channel_data.get("items", [])
        
        if not channel_items:
            error_msg = "No channel found for user"
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "last_error": error_msg
            })
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        
        # Get the likes playlist ID
        content_details = channel_items[0].get("contentDetails", {})
        related_playlists = content_details.get("relatedPlaylists", {})
        likes_playlist_id = related_playlists.get("likes")
        
        if not likes_playlist_id:
            error_msg = "Likes playlist not found or not accessible"
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "last_error": error_msg
            })
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        
        # Get liked videos from the playlist
        all_liked_videos = []
        next_page_token = None
        
        while len(all_liked_videos) < sample_size:
            params = {
                "part": "snippet,contentDetails",
                "playlistId": likes_playlist_id,
                "maxResults": min(50, sample_size - len(all_liked_videos))
            }
            
            if next_page_token:
                params["pageToken"] = next_page_token
            
            response = requests.get(
                "https://www.googleapis.com/youtube/v3/playlistItems",
                headers=headers,
                params=params
            )
            
            if response.status_code != 200:
                error_msg = f"Failed to fetch liked videos: {response.text}"
                await analytics_manager.update_sync_status(user.sub, {
                    "is_syncing": False,
                    "sync_in_progress": False,
                    "last_error": error_msg
                })
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_msg
                )
                
            data = response.json()
            items = data.get("items", [])
            
            if not items:
                break
            
            all_liked_videos.extend(items)
            next_page_token = data.get("nextPageToken")
            
            if not next_page_token:
                break
        
        # Process liked videos data
        processed_videos = []
        
        for i, item in enumerate(all_liked_videos[:sample_size]):
            snippet = item.get("snippet", {})
            content_details = item.get("contentDetails", {})
            
            video_id = content_details.get("videoId")
            if not video_id:
                continue
            
            # Get detailed video information
            video_response = requests.get(
                "https://www.googleapis.com/youtube/v3/videos",
                headers=headers,
                params={
                    "part": "contentDetails,snippet,statistics",
                    "id": video_id
                }
            )
            
            if video_response.status_code == 200:
                video_data = video_response.json()
                video_items = video_data.get("items", [])
                
                if video_items:
                    video_item = video_items[0]
                    video_snippet = video_item.get("snippet", {})
                    video_content_details = video_item.get("contentDetails", {})
                    video_statistics = video_item.get("statistics", {})
                    
                    # Parse duration
                    duration_str = video_content_details.get("duration", "PT0S")
                    duration_seconds = 0
                    
                    # Simple ISO 8601 duration parsing
                    import re
                    duration_match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
                    if duration_match:
                        hours = int(duration_match.group(1) or 0)
                        minutes = int(duration_match.group(2) or 0)
                        seconds = int(duration_match.group(3) or 0)
                        duration_seconds = hours * 3600 + minutes * 60 + seconds
                    
                    # Determine video type
                    video_type = "short" if duration_seconds <= 60 else "regular"
                    
                    # Map category ID to name
                    category_id = video_snippet.get("categoryId", "22")
                    category_map = {
                        "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music",
                        "15": "Pets & Animals", "17": "Sports", "19": "Travel & Events",
                        "20": "Gaming", "22": "People & Blogs", "23": "Comedy",
                        "24": "Entertainment", "25": "News & Politics", "26": "Howto & Style",
                        "27": "Education", "28": "Science & Technology", "29": "Nonprofits & Activism"
                    }
                    category_name = category_map.get(category_id, "Other")
                    
                    # Get thumbnail
                    thumbnails = video_snippet.get("thumbnails", {})
                    thumbnail_url = None
                    for quality in ["maxres", "high", "medium", "default"]:
                        if quality in thumbnails:
                            thumbnail_url = thumbnails[quality].get("url")
                            break
                    
                    # Create video data object
                    video_data = {
                        "video_id": video_id,
                        "title": video_snippet.get("title", ""),
                        "description": video_snippet.get("description", ""),
                        "duration_seconds": duration_seconds,
                        "duration_iso": duration_str,
                        "published_at": video_snippet.get("publishedAt", ""),
                        "view_count": int(video_statistics.get("viewCount", 0)),
                        "like_count": int(video_statistics.get("likeCount", 0)),
                        "comment_count": int(video_statistics.get("commentCount", 0)),
                        "category_id": category_id,
                        "category_name": category_name,
                        "video_type": video_type,
                        "tags": video_snippet.get("tags", []),
                        "thumbnail_url": thumbnail_url,
                        "channel_id": video_snippet.get("channelId", ""),
                        "channel_title": video_snippet.get("channelTitle", ""),
                        "channel_url": f"https://youtube.com/channel/{video_snippet.get('channelId', '')}",
                        "liked_at": snippet.get("publishedAt", datetime.now().isoformat()),
                        "position_in_playlist": i + 1
                    }
                    
                    processed_videos.append(video_data)
        
        # Store the liked videos using the manager
        success = await analytics_manager.store_liked_videos_batch(user.sub, processed_videos)
        
        if not success:
            await analytics_manager.update_sync_status(user.sub, {
                "is_syncing": False,
                "sync_in_progress": False,
                "videos_failed": len(processed_videos),
                "last_error": "Failed to store liked videos"
            })
            raise HTTPException(status_code=500, detail="Failed to store liked videos")
        
        # Generate analytics
        analytics_generated = False
        try:
            analytics = await analytics_manager.generate_analytics(user.sub, sample_size)
            analytics_generated = analytics is not None
        except Exception as e:
            print(f"Failed to generate analytics: {e}")
        
        # Update sync status with success
        await analytics_manager.update_sync_status(user.sub, {
            "is_syncing": False,
            "sync_in_progress": False,
            "last_successful_sync": datetime.now().isoformat(),
            "videos_fetched": len(processed_videos),
            "videos_processed": len(processed_videos),
            "videos_failed": 0,
            "last_error": None,
            "consecutive_failures": 0,
            "preferred_sample_size": sample_size
        })
        
        return {
            "success": True, 
            "videos_synced": len(processed_videos), 
            "sample_size": sample_size,
            "analytics_generated": analytics_generated,
            "message": f"Successfully synced {len(processed_videos)} liked videos"
        }
        
    except HTTPException as e:
        # Propagate HTTP exceptions (already formatted)
        # Update sync status with error
        sync_status = {
            "is_syncing": False,
            "error": e.detail,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub,
        }
        kv_store.put_json(f"sync_status_{user.sub}", sync_status)
        raise
    except requests.RequestException as e:
        # Handle network or API-specific errors
        error_msg = f"YouTube API request failed: {str(e)}"
        sync_status = {
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub,
        }
        kv_store.put_json(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg
        ) from e
    except ValueError as e:
        # Handle validation errors
        error_msg = f"Invalid data: {str(e)}"
        sync_status = {
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub,
        }
        kv_store.put_json(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        ) from e
    except Exception as e:
        # Catch-all for unexpected errors
        error_msg = f"Failed to sync liked videos: {str(e)}"
        sync_status = {
            "is_syncing": False,
            "error": error_msg,
            "last_error_time": datetime.now().isoformat(),
            "user_id": user.sub,
        }
        kv_store.put_json(f"sync_status_{user.sub}", sync_status)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        ) from e

@router.get("/sync-status")
async def get_sync_status(user: AuthorizedUser) -> SyncStatusResponse:
    """
    Get the current sync status for a user's liked videos
    """
    try:
        user_id = user.sub
        
        # Get sync status using the manager
        sync_status = await analytics_manager.storage.get_sync_status(user_id)
        
        # Get user summary for additional info
        summary = await analytics_manager.get_user_summary(user_id)
        
        if not sync_status:
            return SyncStatusResponse(
                last_synced=None,
                total_videos=summary.get('total_liked_videos', 0),
                is_syncing=False,
                sample_size=summary.get('preferred_sample_size', 100),
                analytics_available=summary.get('analytics_available', False)
            )
        
        return SyncStatusResponse(
            last_synced=sync_status.get('last_successful_sync'),
            total_videos=summary.get('total_liked_videos', 0),
            is_syncing=sync_status.get('is_syncing', False),
            sample_size=summary.get('preferred_sample_size', 100),
            analytics_available=summary.get('analytics_available', False)
        )
        
    except Exception as e:
        print(f"Error getting sync status for user {user.sub}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sync status: {str(e)}"
        ) from e

@router.get("/analytics")
async def get_analytics(user: AuthorizedUser, sample_size: int = 100) -> AnalyticsResponse:
    """
    Get analytics for user's liked videos
    """
    try:
        user_id = user.sub
        validated_sample_size = analytics_manager.validate_sample_size(sample_size)
        
        print(f"Getting analytics for user {user_id} with sample size {validated_sample_size}")
        
        # Debug: Check if data exists in storage directly
        storage_key = f"analytics_{user_id}_{validated_sample_size}"
        direct_check = kv_store.get_json(storage_key, default=None)
        print(f"Direct storage check - data exists: {direct_check is not None}")
        if direct_check:
            print(f"Direct storage data keys: {list(direct_check.keys())}")
        
        # Get analytics (will generate if needed)
        analytics = await analytics_manager.get_analytics(user_id, validated_sample_size)
        
        print(f"Manager returned analytics: {analytics is not None}")
        if analytics:
            print(f"Analytics data type: {type(analytics)}")
            print(f"Analytics keys: {list(analytics.keys()) if isinstance(analytics, dict) else 'Not a dict'}")
        
        if not analytics:
            print("No analytics returned from manager")
            return AnalyticsResponse(
                success=False,
                analytics=None,
                sample_size=validated_sample_size,
                analysis_date=None,
                data_completeness_score=0.0
            )
        
        return AnalyticsResponse(
            success=True,
            analytics=analytics,
            sample_size=validated_sample_size,
            analysis_date=analytics.get('analysis_date'),
            data_completeness_score=analytics.get('data_completeness_score', 0.0)
        )
        
    except Exception as e:
        print(f"Error getting analytics for user {user.sub}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics: {str(e)}"
        ) from e

@router.get("/summary")
async def get_user_summary(user: AuthorizedUser):
    """
    Get comprehensive user summary for liked videos
    """
    try:
        user_id = user.sub
        summary = await analytics_manager.get_user_summary(user_id)
        return summary
        
    except Exception as e:
        print(f"Error getting user summary for {user.sub}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user summary: {str(e)}"
        ) from e
