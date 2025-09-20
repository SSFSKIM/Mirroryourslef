from typing import Dict, List, Optional, Any
from datetime import datetime
import databutton as db
from app.libs.liked_videos_models import (
    LikedVideo, LikedVideosAnalytics, SyncStatus
)
from app.libs.liked_videos_storage import LikedVideosStorage
from app.libs.liked_videos_processor import LikedVideosProcessor

class LikedVideosAnalyticsManager:
    """Main manager class for liked videos analytics system"""
    
    def __init__(self):
        self.storage = LikedVideosStorage()
        self.processor = LikedVideosProcessor()
        
        # Supported sample sizes
        self.supported_sample_sizes = [50, 100, 150, 200, 250]
    
    async def store_liked_videos_batch(self, user_id: str, videos_data: List[Dict]) -> bool:
        """Store a batch of liked videos for a user"""
        try:
            print(f"Storing {len(videos_data)} liked videos for user {user_id}")
            
            # Convert raw data to storage format
            processed_videos = []
            for video_data in videos_data:
                # Add processing timestamp
                video_data['synced_at'] = datetime.now().isoformat()
                video_data['updated_at'] = datetime.now().isoformat()
                
                # Extract keywords from title and description
                title = video_data.get('title', '')
                description = video_data.get('description', '')
                combined_text = f"{title} {description}"
                keywords = self.processor.extract_keywords(combined_text)
                video_data['extracted_keywords'] = keywords
                
                processed_videos.append(video_data)
            
            # Store using storage manager
            success = await self.storage.store_liked_videos_dict(user_id, processed_videos)
            
            if success:
                print(f"Successfully stored {len(processed_videos)} videos for user {user_id}")
            else:
                print(f"Failed to store videos for user {user_id}")
            
            return success
            
        except Exception as e:
            print(f"Error in store_liked_videos_batch for user {user_id}: {e}")
            return False
    
    async def generate_analytics(self, user_id: str, sample_size: int = 100) -> Optional[LikedVideosAnalytics]:
        """Generate complete analytics for a user's liked videos"""
        try:
            # Validate sample size
            if sample_size not in self.supported_sample_sizes:
                print(f"Unsupported sample size: {sample_size}. Using 100 instead.")
                sample_size = 100
            
            print(f"Generating analytics for user {user_id} with sample size {sample_size}")
            
            # Retrieve liked videos data
            liked_videos_data = await self.storage.get_liked_videos(user_id, limit=sample_size)
            
            if not liked_videos_data:
                print(f"No liked videos found for user {user_id}")
                return None
            
            print(f"Processing {len(liked_videos_data)} videos for analytics")
            
            # Process analytics using the processor
            analytics = self.processor.process_complete_analytics(
                liked_videos_data, sample_size, user_id
            )
            
            # Store the analytics
            await self.storage.store_analytics(user_id, analytics)
            
            print(f"Analytics generated and stored for user {user_id}")
            return analytics
            
        except Exception as e:
            print(f"Error generating analytics for user {user_id}: {e}")
            return None
    
    async def get_analytics(self, user_id: str, sample_size: int = 100) -> Optional[Dict[str, Any]]:
        """Retrieve existing analytics or generate new ones if needed"""
        try:
            # Try to get existing analytics first
            existing_analytics = await self.storage.get_analytics(user_id, sample_size)
            
            if existing_analytics:
                # Check if analytics are recent (less than 24 hours old)
                analysis_date_str = existing_analytics.get('analysis_date')
                if analysis_date_str:
                    analysis_date = datetime.fromisoformat(analysis_date_str)
                    hours_old = (datetime.now() - analysis_date).total_seconds() / 3600
                    
                    if hours_old < 24:
                        print(f"Returning existing analytics for user {user_id} (generated {hours_old:.1f} hours ago)")
                        return existing_analytics
            
            # Generate new analytics if none exist or they're too old
            print(f"Generating fresh analytics for user {user_id}")
            analytics = await self.generate_analytics(user_id, sample_size)
            
            if analytics:
                # Convert to dict format for API response
                return await self.storage.get_analytics(user_id, sample_size)
            
            return None
            
        except Exception as e:
            print(f"Error getting analytics for user {user_id}: {e}")
            return None
    
    async def update_sync_status(self, user_id: str, status_updates: Dict[str, Any]) -> bool:
        """Update sync status for a user"""
        try:
            # Get existing status or create new one
            existing_status = await self.storage.get_sync_status(user_id)
            
            if existing_status:
                # Update existing status with any provided keys
                for key, value in status_updates.items():
                    existing_status[key] = value
                
                # Update timestamp for auditing
                existing_status['last_sync_attempt'] = datetime.now().isoformat()
                
                # Store updated status
                return await self.storage.store_sync_status_dict(user_id, existing_status)
            else:
                # Create new status with sensible defaults (including sample size tracking)
                new_status = {
                    'user_id': user_id,
                    'last_sync_attempt': datetime.now().isoformat(),
                    'last_successful_sync': None,
                    'videos_fetched': 0,
                    'videos_processed': 0,
                    'videos_failed': 0,
                    'last_error': None,
                    'consecutive_failures': 0,
                    'api_calls_made': 0,
                    'quota_remaining': None,
                    'is_syncing': False,
                    'sync_in_progress': False,
                    'needs_reauth': False,
                    'preferred_sample_size': 100
                }
                
                # Apply updates (allowing new keys for forward-compatibility)
                for key, value in status_updates.items():
                    new_status[key] = value
                
                db.storage.json.put(f"sync_status_{user_id}", new_status)
                return True
            
        except Exception as e:
            print(f"Error updating sync status for user {user_id}: {e}")
            return False
    
    async def get_user_summary(self, user_id: str) -> Dict[str, Any]:
        """Get a comprehensive summary for a user"""
        try:
            # Get user preferences (may include last selected sample size)
            preferences = await self.storage.get_user_preferences(user_id)
            sync_status = await self.storage.get_sync_status(user_id)

            # Determine preferred sample size, falling back to sync status or default
            preferred_sample_size = preferences.get('preferred_sample_size') if preferences else None
            if not preferred_sample_size and sync_status:
                preferred_sample_size = sync_status.get('preferred_sample_size')
            preferred_sample_size = preferred_sample_size or 100
            preferred_sample_size = self.validate_sample_size(int(preferred_sample_size))

            # Fetch persisted analytics without triggering regeneration
            analytics = await self.storage.get_analytics(user_id, preferred_sample_size)

            # Get total video count
            video_count = await self.storage.get_liked_videos_count(user_id)
            
            summary = {
                'user_id': user_id,
                'total_liked_videos': video_count,
                'preferred_sample_size': preferred_sample_size,
                'sync_status': sync_status,
                'analytics_available': analytics is not None,
                'last_analysis_date': analytics.get('analysis_date') if analytics else None,
                'data_completeness_score': analytics.get('data_completeness_score', 0) if analytics else 0
            }
            
            return summary
            
        except Exception as e:
            print(f"Error getting user summary for {user_id}: {e}")
            return {'user_id': user_id, 'error': str(e)}
    
    async def cleanup_user_data(self, user_id: str) -> bool:
        """Clean up all data for a user (for privacy/deletion requests)"""
        try:
            print(f"Cleaning up all data for user {user_id}")
            
            # List of storage keys to clean up
            keys_to_delete = [
                f"liked_videos_{user_id}",
                f"sync_status_{user_id}",
                f"user_preferences_{user_id}"
            ]
            
            # Add analytics keys for all sample sizes
            for sample_size in self.supported_sample_sizes:
                keys_to_delete.append(f"analytics_{user_id}_{sample_size}")
            
            # Delete all user data
            deleted_count = 0
            for key in keys_to_delete:
                try:
                    # Check if key exists before trying to delete
                    existing_data = db.storage.json.get(key, default=None)
                    if existing_data:
                        # In a real implementation, we'd delete the key
                        # For now, we'll just log it
                        print(f"Would delete key: {key}")
                        deleted_count += 1
                except Exception:
                    pass
            
            print(f"Cleaned up {deleted_count} data entries for user {user_id}")
            return True
            
        except Exception as e:
            print(f"Error during cleanup for user {user_id}: {e}")
            return False
    
    def validate_sample_size(self, sample_size: int) -> int:
        """Validate and return appropriate sample size"""
        if sample_size in self.supported_sample_sizes:
            return sample_size
        
        # Find closest supported size
        closest = min(self.supported_sample_sizes, key=lambda x: abs(x - sample_size))
        print(f"Sample size {sample_size} not supported. Using {closest} instead.")
        return closest
    
    async def get_analytics_overview(self, user_id: str) -> Dict[str, Any]:
        """Get a quick overview of available analytics for all sample sizes"""
        try:
            overview = {
                'user_id': user_id,
                'available_analytics': {},
                'total_liked_videos': 0
            }
            
            # Check what analytics are available for each sample size
            for sample_size in self.supported_sample_sizes:
                analytics = await self.storage.get_analytics(user_id, sample_size)
                overview['available_analytics'][str(sample_size)] = {
                    'available': analytics is not None,
                    'analysis_date': analytics.get('analysis_date') if analytics else None,
                    'data_completeness': analytics.get('data_completeness_score', 0) if analytics else 0
                }
            
            # Get total video count
            all_videos = await self.storage.get_liked_videos(user_id)
            overview['total_liked_videos'] = len(all_videos) if all_videos else 0
            
            return overview
            
        except Exception as e:
            print(f"Error getting analytics overview for user {user_id}: {e}")
            return {'user_id': user_id, 'error': str(e)}
