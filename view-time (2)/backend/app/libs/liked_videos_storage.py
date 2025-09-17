
from typing import Dict, List, Optional, Any
from datetime import datetime
import databutton as db
from app.libs.liked_videos_models import (
    LikedVideo, LikedVideosAnalytics, SyncStatus,
    KeywordAnalysis, CategoryStats, ChannelStats,
    VideoLengthStats, LikedContentTrends, ShortsAnalysis
)
import json

class LikedVideosStorage:
    """Firestore storage manager for liked videos analytics"""
    
    def __init__(self):
        # Firestore will be initialized by the app framework
        pass
    
    # Collection names
    LIKED_VIDEOS_COLLECTION = "liked_videos"
    ANALYTICS_COLLECTION = "analytics"
    SYNC_STATUS_COLLECTION = "sync_status"
    USER_PREFERENCES_COLLECTION = "user_preferences"
    
    async def store_liked_videos(self, user_id: str, videos: List[LikedVideo]) -> bool:
        """Store multiple liked videos for a user (using LikedVideo objects)"""
        try:
            # Use Firestore batch write for efficiency
            batch_data = []
            
            for video in videos:
                doc_id = f"{user_id}_{video.video_id}"
                video_data = {
                    "user_id": video.user_id,
                    "video_id": video.video_id,
                    "liked_at": video.liked_at.isoformat(),
                    "position_in_playlist": video.position_in_playlist,
                    
                    # Video metadata
                    "title": video.video_metadata.title,
                    "description": video.video_metadata.description,
                    "duration_seconds": video.video_metadata.duration_seconds,
                    "duration_iso": video.video_metadata.duration_iso,
                    "published_at": video.video_metadata.published_at.isoformat(),
                    "view_count": video.video_metadata.view_count,
                    "like_count": video.video_metadata.like_count,
                    "category_id": video.video_metadata.category_id,
                    "category_name": video.video_metadata.category_name,
                    "video_type": video.video_metadata.video_type,
                    "tags": video.video_metadata.tags,
                    "thumbnail_url": video.video_metadata.thumbnail_url,
                    
                    # Channel info
                    "channel_id": video.channel_info.channel_id,
                    "channel_title": video.channel_info.channel_title,
                    "channel_url": video.channel_info.channel_url,
                    "subscriber_count": video.channel_info.subscriber_count,
                    
                    # Analytics data
                    "extracted_keywords": video.extracted_keywords,
                    "sentiment_score": video.sentiment_score,
                    
                    # Timestamps
                    "synced_at": video.synced_at.isoformat(),
                    "updated_at": video.updated_at.isoformat()
                }
                
                batch_data.append({
                    "id": doc_id,
                    "data": video_data
                })
            
            # Store in Firestore using databutton storage as JSON
            storage_key = f"liked_videos_{user_id}"
            db.storage.json.put(storage_key, {
                "videos": batch_data,
                "last_updated": datetime.now().isoformat(),
                "total_count": len(batch_data)
            })
            
            return True
            
        except Exception as e:
            print(f"Error storing liked videos for user {user_id}: {e}")
            return False
    
    async def store_liked_videos_dict(self, user_id: str, videos_data: List[Dict]) -> bool:
        """Store multiple liked videos for a user (using dictionary data)"""
        try:
            # Use Firestore batch write for efficiency
            batch_data = []
            
            for video_data in videos_data:
                video_id = video_data.get("video_id", "")
                doc_id = f"{user_id}_{video_id}"
                
                # Add user_id to the video data
                video_data["user_id"] = user_id
                
                batch_data.append({
                    "id": doc_id,
                    "data": video_data
                })
            
            # Store in Firestore using databutton storage as JSON
            storage_key = f"liked_videos_{user_id}"
            db.storage.json.put(storage_key, {
                "videos": batch_data,
                "last_updated": datetime.now().isoformat(),
                "total_count": len(batch_data)
            })
            
            return True
            
        except Exception as e:
            print(f"Error storing liked videos for user {user_id}: {e}")
            return False
    
    async def get_liked_videos(self, user_id: str, limit: Optional[int] = None) -> List[LikedVideo]:
        """Retrieve liked videos for a user"""
        try:
            storage_key = f"liked_videos_{user_id}"
            data = db.storage.json.get(storage_key, default={})
            
            if not data or "videos" not in data:
                return []
            
            videos = data["videos"]
            
            # Apply limit if specified
            if limit:
                videos = videos[:limit]
            
            # Convert back to LikedVideo objects (simplified for now)
            liked_videos = []
            for video_data in videos:
                # Note: In a real implementation, we'd fully reconstruct the LikedVideo objects
                # For now, we'll return the raw data for processing
                liked_videos.append(video_data["data"])
            
            return liked_videos
            
        except Exception as e:
            print(f"Error retrieving liked videos for user {user_id}: {e}")
            return []
    
    async def get_liked_videos_count(self, user_id: str) -> int:
        """Get the count of liked videos for a user without loading all data"""
        try:
            storage_key = f"liked_videos_{user_id}"
            data = db.storage.json.get(storage_key, default={})
            
            return data.get("total_count", 0)
            
        except Exception as e:
            print(f"Error getting liked videos count for user {user_id}: {e}")
            return 0
    
    async def store_analytics(self, user_id: str, analytics: LikedVideosAnalytics) -> bool:
        """Store complete analytics for a user"""
        try:
            storage_key = f"analytics_{user_id}_{analytics.sample_size}"
            
            analytics_data = {
                "user_id": analytics.user_id,
                "sample_size": analytics.sample_size,
                "total_liked_videos": analytics.total_liked_videos,
                "analysis_date": analytics.analysis_date.isoformat(),
                "last_sync_date": analytics.last_sync_date.isoformat(),
                
                # Keyword analysis
                "keyword_analysis": {
                    "top_keywords": analytics.keyword_analysis.top_keywords,
                    "keyword_categories": analytics.keyword_analysis.keyword_categories,
                    "total_unique_keywords": analytics.keyword_analysis.total_unique_keywords,
                    "average_keywords_per_video": analytics.keyword_analysis.average_keywords_per_video
                },
                
                # Category stats
                "category_stats": {
                    "category_counts": {k.value: v for k, v in analytics.category_stats.category_counts.items()},
                    "category_percentages": {k.value: v for k, v in analytics.category_stats.category_percentages.items()},
                    "top_categories": [cat.value for cat in analytics.category_stats.top_categories]
                },
                
                # Channel stats
                "channel_stats": {
                    "channel_like_counts": analytics.channel_stats.channel_like_counts,
                    "top_channels": analytics.channel_stats.top_channels,
                    "total_unique_channels": analytics.channel_stats.total_unique_channels,
                    "average_likes_per_channel": analytics.channel_stats.average_likes_per_channel,
                    "channel_diversity_score": analytics.channel_stats.channel_diversity_score
                },
                
                # Length stats
                "length_stats": {
                    "length_buckets": analytics.length_stats.length_buckets,
                    "length_percentages": analytics.length_stats.length_percentages,
                    "average_length": analytics.length_stats.average_length,
                    "median_length": analytics.length_stats.median_length,
                    "shorts_count": analytics.length_stats.shorts_count,
                    "regular_count": analytics.length_stats.regular_count,
                    "shorts_percentage": analytics.length_stats.shorts_percentage,
                    "total_duration": analytics.length_stats.total_duration
                },
                
                # Content trends
                "content_trends": {
                    "likes_by_month": analytics.content_trends.likes_by_month,
                    "likes_by_day_of_week": analytics.content_trends.likes_by_day_of_week,
                    "likes_by_hour": analytics.content_trends.likes_by_hour,
                    "most_active_period": analytics.content_trends.most_active_period,
                    "liking_frequency": analytics.content_trends.liking_frequency
                },
                
                # Shorts analysis
                "shorts_analysis": {
                    "total_shorts": analytics.shorts_analysis.total_shorts,
                    "total_regular": analytics.shorts_analysis.total_regular,
                    "shorts_percentage": analytics.shorts_analysis.shorts_percentage,
                    "avg_shorts_duration": analytics.shorts_analysis.avg_shorts_duration,
                    "avg_regular_duration": analytics.shorts_analysis.avg_regular_duration,
                    "shorts_categories": {k.value: v for k, v in analytics.shorts_analysis.shorts_categories.items()},
                    "regular_categories": {k.value: v for k, v in analytics.shorts_analysis.regular_categories.items()}
                },
                
                # Data quality
                "videos_with_metadata": analytics.videos_with_metadata,
                "videos_missing_data": analytics.videos_missing_data,
                "data_completeness_score": analytics.data_completeness_score
            }
            
            db.storage.json.put(storage_key, analytics_data)
            return True
            
        except Exception as e:
            print(f"Error storing analytics for user {user_id}: {e}")
            return False
    
    async def get_analytics(self, user_id: str, sample_size: int) -> Optional[Dict[str, Any]]:
        """Retrieve analytics for a user and sample size"""
        try:
            storage_key = f"analytics_{user_id}_{sample_size}"
            return db.storage.json.get(storage_key, default=None)
            
        except Exception as e:
            print(f"Error retrieving analytics for user {user_id}: {e}")
            return None
    
    async def store_sync_status(self, user_id: str, status: SyncStatus) -> bool:
        """Store sync status for a user (using SyncStatus object)"""
        try:
            storage_key = f"sync_status_{user_id}"
            
            status_data = {
                "user_id": status.user_id,
                "last_sync_attempt": status.last_sync_attempt.isoformat(),
                "last_successful_sync": status.last_successful_sync.isoformat() if status.last_successful_sync else None,
                "videos_fetched": status.videos_fetched,
                "videos_processed": status.videos_processed,
                "videos_failed": status.videos_failed,
                "last_error": status.last_error,
                "consecutive_failures": status.consecutive_failures,
                "api_calls_made": status.api_calls_made,
                "quota_remaining": status.quota_remaining,
                "is_syncing": status.is_syncing,
                "sync_in_progress": status.sync_in_progress,
                "needs_reauth": status.needs_reauth,
                "updated_at": datetime.now().isoformat()
            }
            
            db.storage.json.put(storage_key, status_data)
            return True
            
        except Exception as e:
            print(f"Error storing sync status for user {user_id}: {e}")
            return False
    
    async def store_sync_status_dict(self, user_id: str, status_data: Dict) -> bool:
        """Store sync status for a user (using dictionary data)"""
        try:
            storage_key = f"sync_status_{user_id}"
            
            # Ensure user_id is in the data
            status_data["user_id"] = user_id
            status_data["updated_at"] = datetime.now().isoformat()
            
            db.storage.json.put(storage_key, status_data)
            return True
            
        except Exception as e:
            print(f"Error storing sync status for user {user_id}: {e}")
            return False
    
    async def get_sync_status(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve sync status for a user"""
        try:
            storage_key = f"sync_status_{user_id}"
            return db.storage.json.get(storage_key, default=None)
            
        except Exception as e:
            print(f"Error retrieving sync status for user {user_id}: {e}")
            return None
    
    async def store_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Store user preferences (sample size, etc.)"""
        try:
            storage_key = f"user_preferences_{user_id}"
            
            prefs_data = {
                "user_id": user_id,
                "preferred_sample_size": preferences.get("preferred_sample_size", 100),
                "auto_sync_enabled": preferences.get("auto_sync_enabled", True),
                "notification_preferences": preferences.get("notification_preferences", {}),
                "privacy_settings": preferences.get("privacy_settings", {}),
                "updated_at": datetime.now().isoformat()
            }
            
            db.storage.json.put(storage_key, prefs_data)
            return True
            
        except Exception as e:
            print(f"Error storing user preferences for user {user_id}: {e}")
            return False
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Retrieve user preferences with defaults"""
        try:
            storage_key = f"user_preferences_{user_id}"
            return db.storage.json.get(storage_key, default={
                "preferred_sample_size": 100,
                "auto_sync_enabled": True,
                "notification_preferences": {},
                "privacy_settings": {}
            })
            
        except Exception as e:
            print(f"Error retrieving user preferences for user {user_id}: {e}")
            return {
                "preferred_sample_size": 100,
                "auto_sync_enabled": True,
                "notification_preferences": {},
                "privacy_settings": {}
            }
    
    async def cleanup_old_data(self, user_id: str, days_to_keep: int = 30) -> bool:
        """Clean up old analytics data to save storage space"""
        try:
            # This would implement cleanup logic for old analytics
            # For now, we'll just return True as a placeholder
            print(f"Cleanup initiated for user {user_id}, keeping {days_to_keep} days of data")
            return True
            
        except Exception as e:
            print(f"Error during cleanup for user {user_id}: {e}")
            return False
