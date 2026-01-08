from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import re
from statistics import median
from app.libs.liked_videos_models import (
    LikedVideo, VideoMetadata, ChannelInfo, VideoType, VideoCategory,
    KeywordAnalysis, CategoryStats, ChannelStats, VideoLengthStats,
    LikedContentTrends, ShortsAnalysis, LikedVideosAnalytics
)

class LikedVideosProcessor:
    """Process liked videos data into analytics insights"""
    
    def __init__(self):
        # Common English stop words to filter out
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i',
            'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
            'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
            'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
            'what', 'which', 'who', 'whom', 'whose', 'this', 'that', 'these', 'those', 'am',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
            'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should', 'may', 'might',
            'must', 'can', 'shall'
        }
        
        # Video length buckets in seconds
        self.length_buckets = {
            "0-60": (0, 60),
            "60-300": (60, 300),  # 1-5 minutes
            "300-600": (300, 600),  # 5-10 minutes
            "600-1800": (600, 1800),  # 10-30 minutes
            "1800+": (1800, float('inf'))  # 30+ minutes
        }
    
    def extract_keywords(self, text: str, max_keywords: int = 20) -> List[str]:
        """Extract meaningful keywords from video title and description"""
        if not text:
            return []
        
        # Clean and normalize text
        text = text.lower()
        # Remove special characters and split into words
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text)  # Words with 3+ characters
        
        # Filter out stop words
        keywords = [word for word in words if word not in self.stop_words]
        
        # Count frequency and return top keywords
        word_counts = Counter(keywords)
        return [word for word, count in word_counts.most_common(max_keywords)]
    
    def categorize_video_length(self, duration_seconds: int) -> str:
        """Categorize video by length"""
        for bucket, (min_val, max_val) in self.length_buckets.items():
            if min_val <= duration_seconds < max_val:
                return bucket
        return "1800+"  # Default for very long videos
    
    def is_shorts_video(self, video_metadata: VideoMetadata) -> bool:
        """Determine if a video is a YouTube Short"""
        # YouTube Shorts are typically under 60 seconds
        return (video_metadata.video_type == VideoType.SHORT or 
                video_metadata.duration_seconds <= 60)
    
    def process_keyword_analysis(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> KeywordAnalysis:
        """Process keyword analysis from liked videos"""
        all_keywords = []
        keyword_categories = defaultdict(list)
        
        for video in liked_videos[:sample_size]:
            # Extract keywords from title and description
            title_keywords = self.extract_keywords(video.get('title', ''), 10)
            desc_keywords = self.extract_keywords(video.get('description', ''), 5)
            
            video_keywords = title_keywords + desc_keywords
            all_keywords.extend(video_keywords)
            
            # Categorize keywords by video category
            category = video.get('category_name', 'Other')
            keyword_categories[category].extend(video_keywords)
        
        # Count keyword frequency
        keyword_counts = Counter(all_keywords)
        top_keywords = dict(keyword_counts.most_common(50))
        
        # Clean up keyword categories
        clean_categories = {}
        for category, keywords in keyword_categories.items():
            category_counts = Counter(keywords)
            clean_categories[category] = [word for word, count in category_counts.most_common(10)]
        
        return KeywordAnalysis(
            user_id=user_id,
            sample_size=sample_size,
            top_keywords=top_keywords,
            keyword_categories=clean_categories,
            analysis_date=datetime.now(),
            total_unique_keywords=len(top_keywords),
            average_keywords_per_video=len(all_keywords) / len(liked_videos[:sample_size]) if liked_videos else 0
        )
    
    def process_category_stats(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> CategoryStats:
        """Process category statistics from liked videos"""
        category_counts = Counter()
        category_durations = defaultdict(int)
        
        videos_subset = liked_videos[:sample_size]
        
        for video in videos_subset:
            raw_category = video.get('category_name', 'Other')
            try:
                category = VideoCategory(raw_category)
            except ValueError:
                category = VideoCategory.OTHER
            category_counts[category] += 1
            category_durations[category] += video.get('duration_seconds', 0)
        
        # Calculate percentages
        total_videos = len(videos_subset)
        category_percentages = {}
        for category, count in category_counts.items():
            category_percentages[category] = (count / total_videos) * 100 if total_videos > 0 else 0
        
        # Get top categories
        top_categories = [category for category, count in category_counts.most_common()]
        
        return CategoryStats(
            user_id=user_id,
            sample_size=sample_size,
            category_counts=dict(category_counts),
            category_percentages=category_percentages,
            category_total_duration=dict(category_durations),
            top_categories=top_categories,
            analysis_date=datetime.now()
        )
    
    def process_channel_stats(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> ChannelStats:
        """Process channel statistics from liked videos"""
        channel_counts = Counter()
        channel_info_map = {}
        
        videos_subset = liked_videos[:sample_size]
        
        for video in videos_subset:
            channel_id = video.get('channel_id')
            if channel_id:
                channel_counts[channel_id] += 1
                
                # Store channel info (latest version)
                if channel_id not in channel_info_map:
                    channel_info_map[channel_id] = ChannelInfo(
                        channel_id=channel_id,
                        channel_title=video.get('channel_title', ''),
                        channel_url=video.get('channel_url', ''),
                        subscriber_count=video.get('subscriber_count')
                    )
        
        # Calculate diversity score (entropy-like measure)
        total_videos = len(videos_subset)
        diversity_score = 0.0
        if total_videos > 0:
            for count in channel_counts.values():
                probability = count / total_videos
                if probability > 0:
                    diversity_score -= probability * (probability ** 0.5)  # Modified entropy
        
        return ChannelStats(
            user_id=user_id,
            sample_size=sample_size,
            channel_like_counts=dict(channel_counts),
            channel_info_map=channel_info_map,
            top_channels=[channel_id for channel_id, count in channel_counts.most_common(20)],
            total_unique_channels=len(channel_counts),
            average_likes_per_channel=sum(channel_counts.values()) / len(channel_counts) if channel_counts else 0,
            channel_diversity_score=diversity_score,
            analysis_date=datetime.now()
        )
    
    def process_length_stats(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> VideoLengthStats:
        """Process video length statistics"""
        videos_subset = liked_videos[:sample_size]
        durations = [video.get('duration_seconds', 0) for video in videos_subset]
        
        # Categorize by length buckets
        length_bucket_counts = Counter()
        shorts_count = 0
        regular_count = 0
        
        for duration in durations:
            bucket = self.categorize_video_length(duration)
            length_bucket_counts[bucket] += 1
            
            # Count shorts vs regular
            if duration <= 60:  # Shorts are typically <= 60 seconds
                shorts_count += 1
            else:
                regular_count += 1
        
        # Calculate percentages
        total_videos = len(videos_subset)
        length_percentages = {}
        for bucket, count in length_bucket_counts.items():
            length_percentages[bucket] = (count / total_videos) * 100 if total_videos > 0 else 0
        
        return VideoLengthStats(
            user_id=user_id,
            sample_size=sample_size,
            length_buckets=dict(length_bucket_counts),
            length_percentages=length_percentages,
            average_length=sum(durations) / len(durations) if durations else 0,
            median_length=median(durations) if durations else 0,
            shortest_video=min(durations) if durations else 0,
            longest_video=max(durations) if durations else 0,
            total_duration=sum(durations),
            shorts_count=shorts_count,
            regular_count=regular_count,
            shorts_percentage=(shorts_count / total_videos) * 100 if total_videos > 0 else 0,
            analysis_date=datetime.now()
        )
    
    def process_content_trends(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> LikedContentTrends:
        """Process content trends over time"""
        videos_subset = liked_videos[:sample_size]
        
        likes_by_month = defaultdict(int)
        likes_by_day_of_week = defaultdict(int)
        likes_by_hour = defaultdict(int)
        
        earliest_date = None
        latest_date = None
        
        for video in videos_subset:
            liked_at_str = video.get('liked_at')
            if liked_at_str:
                try:
                    liked_at = datetime.fromisoformat(liked_at_str.replace('Z', '+00:00'))
                    
                    # Track date range
                    if earliest_date is None or liked_at < earliest_date:
                        earliest_date = liked_at
                    if latest_date is None or liked_at > latest_date:
                        latest_date = liked_at
                    
                    # Monthly trends
                    month_key = liked_at.strftime('%Y-%m')
                    likes_by_month[month_key] += 1
                    
                    # Day of week trends
                    day_name = liked_at.strftime('%A')
                    likes_by_day_of_week[day_name] += 1
                    
                    # Hourly trends
                    hour = liked_at.hour
                    likes_by_hour[hour] += 1
                    
                except ValueError:
                    continue
        
        # Find most active period
        most_active_period = "Unknown"
        if likes_by_hour:
            peak_hour = max(likes_by_hour.items(), key=lambda x: x[1])[0]
            if 6 <= peak_hour < 12:
                most_active_period = "Morning"
            elif 12 <= peak_hour < 18:
                most_active_period = "Afternoon"
            elif 18 <= peak_hour < 24:
                most_active_period = "Evening"
            else:
                most_active_period = "Night"
        
        # Calculate liking frequency
        liking_frequency = 0.0
        if earliest_date and latest_date:
            days_span = (latest_date - earliest_date).days
            if days_span > 0:
                liking_frequency = len(videos_subset) / days_span
        
        return LikedContentTrends(
            user_id=user_id,
            sample_size=sample_size,
            likes_by_month=dict(likes_by_month),
            likes_by_day_of_week=dict(likes_by_day_of_week),
            likes_by_hour=dict(likes_by_hour),
            most_active_period=most_active_period,
            liking_frequency=liking_frequency,
            seasonal_patterns={},  # Could be expanded later
            category_trends={},  # Could be expanded later
            channel_loyalty={},  # Could be expanded later
            analysis_date=datetime.now(),
            date_range_start=earliest_date or datetime.now(),
            date_range_end=latest_date or datetime.now()
        )
    
    def process_shorts_analysis(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> ShortsAnalysis:
        """Process Shorts vs regular videos analysis"""
        videos_subset = liked_videos[:sample_size]
        
        shorts_videos = []
        regular_videos = []
        
        for video in videos_subset:
            duration = video.get('duration_seconds', 0)
            if duration <= 60:  # Consider as Shorts
                shorts_videos.append(video)
            else:
                regular_videos.append(video)
        
        # Category analysis
        shorts_categories = Counter()
        regular_categories = Counter()
        
        for video in shorts_videos:
            raw_category = video.get('category_name', 'Other')
            try:
                category = VideoCategory(raw_category)
            except ValueError:
                category = VideoCategory.OTHER
            shorts_categories[category] += 1
        
        for video in regular_videos:
            raw_category = video.get('category_name', 'Other')
            try:
                category = VideoCategory(raw_category)
            except ValueError:
                category = VideoCategory.OTHER
            regular_categories[category] += 1
        
        # Channel analysis
        shorts_channels = Counter()
        regular_channels = Counter()
        
        for video in shorts_videos:
            channel_id = video.get('channel_id')
            if channel_id:
                shorts_channels[channel_id] += 1
        
        for video in regular_videos:
            channel_id = video.get('channel_id')
            if channel_id:
                regular_channels[channel_id] += 1
        
        # Calculate averages
        shorts_durations = [v.get('duration_seconds', 0) for v in shorts_videos]
        regular_durations = [v.get('duration_seconds', 0) for v in regular_videos]
        
        return ShortsAnalysis(
            user_id=user_id,
            sample_size=sample_size,
            total_shorts=len(shorts_videos),
            total_regular=len(regular_videos),
            shorts_percentage=(len(shorts_videos) / len(videos_subset)) * 100 if videos_subset else 0,
            avg_shorts_duration=sum(shorts_durations) / len(shorts_durations) if shorts_durations else 0,
            avg_regular_duration=sum(regular_durations) / len(regular_durations) if regular_durations else 0,
            shorts_categories=dict(shorts_categories),
            regular_categories=dict(regular_categories),
            shorts_channels=dict(shorts_channels),
            regular_channels=dict(regular_channels),
            shorts_by_time={},  # Could be expanded
            regular_by_time={},  # Could be expanded
            analysis_date=datetime.now()
        )
    
    def process_complete_analytics(self, liked_videos: List[Dict], sample_size: int, user_id: str) -> LikedVideosAnalytics:
        """Process all analytics components for liked videos"""
        videos_with_metadata = len([v for v in liked_videos[:sample_size] if v.get('title')])
        videos_missing_data = sample_size - videos_with_metadata
        
        return LikedVideosAnalytics(
            user_id=user_id,
            sample_size=sample_size,
            keyword_analysis=self.process_keyword_analysis(liked_videos, sample_size, user_id),
            category_stats=self.process_category_stats(liked_videos, sample_size, user_id),
            channel_stats=self.process_channel_stats(liked_videos, sample_size, user_id),
            length_stats=self.process_length_stats(liked_videos, sample_size, user_id),
            content_trends=self.process_content_trends(liked_videos, sample_size, user_id),
            shorts_analysis=self.process_shorts_analysis(liked_videos, sample_size, user_id),
            total_liked_videos=len(liked_videos),
            analysis_date=datetime.now(),
            last_sync_date=datetime.now(),  # Would be set from actual sync data
            videos_with_metadata=videos_with_metadata,
            videos_missing_data=videos_missing_data,
            data_completeness_score=(videos_with_metadata / sample_size) * 100 if sample_size > 0 else 0
        )
