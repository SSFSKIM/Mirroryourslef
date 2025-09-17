from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class VideoType(str, Enum):
    """Enum for video types"""
    REGULAR = "regular"
    SHORT = "short"
    LIVE = "live"
    PREMIERE = "premiere"

class VideoCategory(str, Enum):
    """Common YouTube video categories"""
    MUSIC = "Music"
    GAMING = "Gaming"
    ENTERTAINMENT = "Entertainment"
    NEWS = "News & Politics"
    HOWTO = "Howto & Style"
    EDUCATION = "Education"
    SCIENCE = "Science & Technology"
    NONPROFITS = "Nonprofits & Activism"
    COMEDY = "Comedy"
    PEOPLE = "People & Blogs"
    PETS = "Pets & Animals"
    TRAVEL = "Travel & Events"
    AUTOS = "Autos & Vehicles"
    SPORTS = "Sports"
    FILM = "Film & Animation"
    OTHER = "Other"

class ChannelInfo(BaseModel):
    """Information about a YouTube channel"""
    channel_id: str
    channel_title: str
    channel_url: str
    subscriber_count: Optional[int] = None
    video_count: Optional[int] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: Optional[datetime] = None

class VideoMetadata(BaseModel):
    """Comprehensive metadata for a YouTube video"""
    video_id: str
    title: str
    description: Optional[str] = None
    duration_seconds: int
    duration_iso: str  # ISO 8601 duration format (PT1M30S)
    published_at: datetime
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    category_id: str
    category_name: VideoCategory
    tags: List[str] = []
    default_language: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_type: VideoType
    is_live_content: bool = False
    made_for_kids: bool = False

class LikedVideo(BaseModel):
    """Main model for a user's liked video with all metadata"""
    user_id: str
    video_id: str
    liked_at: datetime  # When the user liked the video
    position_in_playlist: int  # Position in the likes playlist
    
    # Video metadata
    video_metadata: VideoMetadata
    
    # Channel information
    channel_info: ChannelInfo
    
    # Processed data for analytics
    extracted_keywords: List[str] = []
    sentiment_score: Optional[float] = None  # If we add sentiment analysis
    
    # Timestamps
    synced_at: datetime  # When this data was fetched from YouTube API
    updated_at: datetime  # Last time this record was updated

class KeywordAnalysis(BaseModel):
    """Analysis of keywords extracted from liked videos"""
    user_id: str
    sample_size: int  # Number of videos analyzed (50, 100, 150, 200, 250)
    
    # Keyword frequency analysis
    top_keywords: Dict[str, int]  # keyword -> frequency
    keyword_categories: Dict[str, List[str]]  # category -> list of keywords
    
    # Metadata
    analysis_date: datetime
    total_unique_keywords: int
    average_keywords_per_video: float

class CategoryStats(BaseModel):
    """Statistics about video categories in liked videos"""
    user_id: str
    sample_size: int
    
    # Category distribution
    category_counts: Dict[VideoCategory, int]
    category_percentages: Dict[VideoCategory, float]
    category_total_duration: Dict[VideoCategory, int]  # Total seconds
    
    # Top categories
    top_categories: List[VideoCategory]
    
    # Metadata
    analysis_date: datetime

class ChannelStats(BaseModel):
    """Statistics about channels in liked videos"""
    user_id: str
    sample_size: int
    
    # Channel metrics
    channel_like_counts: Dict[str, int]  # channel_id -> number of liked videos
    channel_info_map: Dict[str, ChannelInfo]  # channel_id -> channel info
    top_channels: List[str]  # List of channel_ids ordered by like count
    
    # Analysis metrics
    total_unique_channels: int
    average_likes_per_channel: float
    channel_diversity_score: float  # How diverse the channel preferences are
    
    # Metadata
    analysis_date: datetime

class VideoLengthStats(BaseModel):
    """Statistics about video lengths in liked videos"""
    user_id: str
    sample_size: int
    
    # Length distribution (in seconds)
    length_buckets: Dict[str, int]  # "0-60", "60-300", "300-600", "600-1800", "1800+"
    length_percentages: Dict[str, float]
    
    # Summary statistics
    average_length: float  # Average duration in seconds
    median_length: float
    shortest_video: int
    longest_video: int
    total_duration: int  # Total seconds of all liked videos
    
    # Shorts vs Regular breakdown
    shorts_count: int
    regular_count: int
    shorts_percentage: float
    
    # Metadata
    analysis_date: datetime

class LikedContentTrends(BaseModel):
    """Trends and patterns in liked content over time"""
    user_id: str
    sample_size: int
    
    # Time-based patterns
    likes_by_month: Dict[str, int]  # "2024-01" -> count
    likes_by_day_of_week: Dict[str, int]  # "Monday" -> count
    likes_by_hour: Dict[int, int]  # hour (0-23) -> count
    
    # Trending patterns
    most_active_period: str  # When user likes most content
    liking_frequency: float  # Average likes per day
    seasonal_patterns: Dict[str, float]  # Season -> activity score
    
    # Content evolution
    category_trends: Dict[str, List[int]]  # category -> monthly counts
    channel_loyalty: Dict[str, List[int]]  # channel -> monthly likes
    
    # Metadata
    analysis_date: datetime
    date_range_start: datetime
    date_range_end: datetime

class ShortsAnalysis(BaseModel):
    """Detailed analysis of YouTube Shorts vs regular videos"""
    user_id: str
    sample_size: int
    
    # Basic counts
    total_shorts: int
    total_regular: int
    shorts_percentage: float
    
    # Comparative analysis
    avg_shorts_duration: float
    avg_regular_duration: float
    
    # Category preferences
    shorts_categories: Dict[VideoCategory, int]
    regular_categories: Dict[VideoCategory, int]
    
    # Channel preferences
    shorts_channels: Dict[str, int]  # channel_id -> shorts count
    regular_channels: Dict[str, int]  # channel_id -> regular videos count
    
    # Temporal patterns
    shorts_by_time: Dict[str, int]  # Time period -> shorts count
    regular_by_time: Dict[str, int]  # Time period -> regular count
    
    # Engagement patterns
    shorts_avg_views: Optional[float] = None
    regular_avg_views: Optional[float] = None
    shorts_avg_likes: Optional[float] = None
    regular_avg_likes: Optional[float] = None
    
    # Metadata
    analysis_date: datetime

class LikedVideosAnalytics(BaseModel):
    """Complete analytics package for a user's liked videos"""
    user_id: str
    sample_size: int
    
    # All analytics components
    keyword_analysis: KeywordAnalysis
    category_stats: CategoryStats
    channel_stats: ChannelStats
    length_stats: VideoLengthStats
    content_trends: LikedContentTrends
    shorts_analysis: ShortsAnalysis
    
    # Summary metrics
    total_liked_videos: int
    analysis_date: datetime
    last_sync_date: datetime
    
    # Data quality metrics
    videos_with_metadata: int
    videos_missing_data: int
    data_completeness_score: float

class SyncStatus(BaseModel):
    """Status of liked videos synchronization"""
    user_id: str
    last_sync_attempt: datetime
    last_successful_sync: Optional[datetime] = None
    
    # Sync metrics
    videos_fetched: int
    videos_processed: int
    videos_failed: int
    
    # Error tracking
    last_error: Optional[str] = None
    consecutive_failures: int = 0
    
    # API usage
    api_calls_made: int
    quota_remaining: Optional[int] = None
    
    # Status flags
    is_syncing: bool = False
    sync_in_progress: bool = False
    needs_reauth: bool = False
