from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class WatchEvent:
    """A single YouTube watch event from Google Takeout."""
    user_id: str
    video_id: str
    title: str
    channel_title: str
    watched_at: datetime
    source: str  # "algorithmic" or "intentional"
    source_detail: Optional[str]
    url: Optional[str]
    duration_seconds: Optional[int]
    is_short: bool


@dataclass
class WatchSession:
    """A continuous viewing session with estimated duration."""
    user_id: str
    start_time: datetime
    end_time: datetime
    event_ids: List[str]
    video_ids: List[str]
    shorts_count: int
    total_events: int
    estimated_duration_seconds: int


@dataclass
class RepeatView:
    """A video that was watched multiple times."""
    video_id: str
    title: str
    channel_title: str
    watch_count: int
    last_watched_at: datetime


@dataclass
class WatchHistoryAnalytics:
    """Comprehensive analytics derived from watch history."""
    user_id: str
    generated_at: datetime
    
    # Basic stats
    total_events: int
    unique_videos: int
    unique_channels: int
    
    # Session analysis
    average_session_duration_minutes: float
    average_videos_per_session: float
    average_shorts_streak_minutes: float
    
    # Viewing behavior
    algorithmic_view_share: float
    intentional_view_share: float
    recommendation_breakdown: Dict[str, int]
    
    # Repeat viewing
    repeat_views: List[RepeatView]
    
    # Time patterns
    heatmap: Dict[str, Dict[str, int]]  # weekday -> hour -> count
    daily_distribution: Dict[str, int]  # date -> count
    
    # Summary metrics
    shorts_share: float
    daily_average_minutes: float
    weekly_minutes: float
