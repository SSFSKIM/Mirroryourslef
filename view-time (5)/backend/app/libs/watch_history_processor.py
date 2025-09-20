from __future__ import annotations

import io
import json
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

from app.libs.watch_history_models import (
    RepeatView,
    WatchEvent,
    WatchHistoryAnalytics,
    WatchSession,
)

ALGORTHMIC_KEYWORDS = [
    "Recommended for you",
    "Suggested video",
    "From Google Ads",
    "From your YouTube Mix",
    "Autoplay",
    "Because you watched",
    "Watch Next",
    "Home",
]

INTENTIONAL_KEYWORDS = [
    "From your history",
    "From subscriptions",
    "Searched for",
    "Watch later",
    "Playlist",
    "Channel",
    "Library",
]

SESSION_INACTIVITY_THRESHOLD = timedelta(minutes=30)
DEFAULT_EVENT_DURATION_SECONDS = 300
MAX_GAP_CONTRIBUTION_SECONDS = 900
SHORT_ESTIMATED_SECONDS = 45

SESSION_DURATION_BUCKETS = [
    ("<5 min", 0, 5),
    ("5-15 min", 5, 15),
    ("15-30 min", 15, 30),
    ("30-60 min", 30, 60),
    (">60 min", 60, None),
]


class WatchHistoryProcessor:
    """Parses Google Takeout exports and produces aggregated analytics."""

    def parse_takeout(self, user_id: str, file_bytes: bytes, filename: str) -> List[WatchEvent]:
        payload = self._load_payload(file_bytes, filename)
        events: List[WatchEvent] = []

        if not isinstance(payload, list):
            # Some exports wrap the list inside a dictionary
            payload = payload.get("watchHistory", []) if isinstance(payload, dict) else []

        for entry in payload:
            event = self._convert_entry(user_id, entry)
            if event:
                events.append(event)

        # Sort newest first for consistency
        events.sort(key=lambda item: item.watched_at, reverse=True)
        return events

    def _load_payload(self, file_bytes: bytes, filename: str) -> Any:
        if filename.endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as archive:
                # Prefer JSON exports
                json_members = [name for name in archive.namelist() if name.endswith(".json")]
                if not json_members:
                    raise ValueError("Zip archive does not contain a JSON watch history file")
                with archive.open(json_members[0]) as handle:
                    return json.loads(handle.read().decode("utf-8"))

        text = file_bytes.decode("utf-8")
        return json.loads(text)

    def _convert_entry(self, user_id: str, entry: Dict[str, Any]) -> Optional[WatchEvent]:
        title = entry.get("title", "")
        title_url = entry.get("titleUrl")
        subtitles = entry.get("subtitles", [])
        details = entry.get("details", [])
        time_raw = entry.get("time")

        if not time_raw or "Watched" not in title:
            return None

        try:
            watched_at = self._parse_datetime(time_raw)
        except ValueError:
            return None

        readable_title = self._strip_prefix(title)
        channel_title = self._get_channel(subtitles)
        video_id = self._extract_video_id(title_url)
        if not video_id:
            return None

        url = title_url
        is_short = self._is_short(url)
        source, source_detail = self._classify_source(details)

        return WatchEvent(
            user_id=user_id,
            video_id=video_id,
            title=readable_title,
            channel_title=channel_title,
            watched_at=watched_at,
            source=source,
            source_detail=source_detail,
            url=url,
            duration_seconds=None,
            is_short=is_short,
        )

    def _strip_prefix(self, title: str) -> str:
        # Takeout titles look like "Watched "My Video""
        if title.startswith("Watched "):
            return title.replace("Watched ", "", 1).strip().strip('"')
        return title

    def _get_channel(self, subtitles: Iterable[Dict[str, Any]]) -> str:
        for item in subtitles:
            name = item.get("name")
            if name:
                return name
        return "Unknown channel"

    def _extract_video_id(self, url: Optional[str]) -> Optional[str]:
        if not url:
            return None

        parsed = urlparse(url)
        if "watch" in parsed.path:
            query = parse_qs(parsed.query)
            video_ids = query.get("v")
            if video_ids:
                return video_ids[0]
        elif "/shorts/" in parsed.path:
            return parsed.path.split("/shorts/")[-1].split("/")[0]
        elif parsed.path:
            path_parts = parsed.path.strip("/").split("/")
            if path_parts:
                return path_parts[-1]
        return None

    def _is_short(self, url: Optional[str]) -> bool:
        if not url:
            return False
        return "/shorts/" in url or "youtube.com/shorts" in url

    def _parse_datetime(self, value: str) -> datetime:
        # Takeout uses ISO8601 with Z suffix
        if value.endswith("Z"):
            value = value.replace("Z", "")
            return datetime.fromisoformat(value).replace(tzinfo=None)
        return datetime.fromisoformat(value)

    def _classify_source(self, details: Iterable[Dict[str, Any]]) -> Tuple[str, Optional[str]]:
        for item in details or []:
            name = item.get("name", "")
            if any(keyword.lower() in name.lower() for keyword in ALGORTHMIC_KEYWORDS):
                return "algorithmic", name
            if any(keyword.lower() in name.lower() for keyword in INTENTIONAL_KEYWORDS):
                return "intentional", name

        # Default heuristics based on blank detail
        return "algorithmic", None

    def compute_analytics(self, user_id: str, events: List[WatchEvent]) -> WatchHistoryAnalytics:
        if not events:
            now = datetime.now()
            empty_repeat: List[RepeatView] = []
            return WatchHistoryAnalytics(
                user_id=user_id,
                generated_at=now,
                total_events=0,
                unique_videos=0,
                unique_channels=0,
                average_session_duration_minutes=0.0,
                average_videos_per_session=0.0,
                average_shorts_streak_minutes=0.0,
                algorithmic_view_share=0.0,
                intentional_view_share=0.0,
                recommendation_breakdown={},
                repeat_views=empty_repeat,
                heatmap={},
                daily_distribution={},
                shorts_share=0.0,
                daily_average_minutes=0.0,
                weekly_minutes=0.0,
                session_distribution={label: 0 for label, _lower, _upper in SESSION_DURATION_BUCKETS},
                longest_session_minutes=0.0,
                shorts_total_minutes=0.0,
                algorithmic_minutes=0.0,
                intentional_minutes=0.0,
            )

        # Sort ascending for sessionisation
        ascending_events = sorted(events, key=lambda event: event.watched_at)
        sessions = self._build_sessions(user_id, ascending_events)
        estimated_total_seconds = sum(session.estimated_duration_seconds for session in sessions)

        average_session_duration_minutes = (
            estimated_total_seconds / len(sessions) / 60 if sessions else 0.0
        )
        average_videos_per_session = (
            sum(session.total_events for session in sessions) / len(sessions) if sessions else 0.0
        )
        average_shorts_streak_minutes = self._average_shorts_streak(events)

        algorithmic_count = sum(1 for event in events if event.source == "algorithmic")
        intentional_count = len(events) - algorithmic_count
        total_events = len(events)

        recommendation_breakdown: Dict[str, int] = defaultdict(int)
        for event in events:
            key = event.source_detail or ("Algorithmic" if event.source == "algorithmic" else "Intentional")
            recommendation_breakdown[key] += 1

        repeat_views = self._repeat_views(events)
        heatmap = self._build_heatmap(events)
        daily_distribution = self._daily_distribution(events)
        shorts_share = sum(1 for event in events if event.is_short) / total_events
        session_distribution = self._session_distribution(sessions)
        longest_session_minutes = (
            max((session.estimated_duration_seconds for session in sessions), default=0) / 60
        )
        shorts_total_minutes = (
            sum(session.shorts_count for session in sessions) * SHORT_ESTIMATED_SECONDS / 60
        )

        date_range_days = (
            (ascending_events[-1].watched_at.date() - ascending_events[0].watched_at.date()).days + 1
        )
        daily_average_minutes = (
            estimated_total_seconds / 60 / max(date_range_days, 1)
        )
        weeks = max(date_range_days / 7, 1)
        weekly_minutes = estimated_total_seconds / 60 / weeks

        algorithmic_minutes = (
            estimated_total_seconds / 60 * (algorithmic_count / total_events)
            if total_events
            else 0.0
        )
        intentional_minutes = (
            estimated_total_seconds / 60 * (intentional_count / total_events)
            if total_events
            else 0.0
        )

        return WatchHistoryAnalytics(
            user_id=user_id,
            generated_at=datetime.now(),
            total_events=total_events,
            unique_videos=len({event.video_id for event in events}),
            unique_channels=len({event.channel_title for event in events}),
            average_session_duration_minutes=round(average_session_duration_minutes, 2),
            average_videos_per_session=round(average_videos_per_session, 2),
            average_shorts_streak_minutes=round(average_shorts_streak_minutes, 2),
            algorithmic_view_share=round(algorithmic_count / total_events, 3),
            intentional_view_share=round(intentional_count / total_events, 3),
            recommendation_breakdown=dict(sorted(recommendation_breakdown.items(), key=lambda item: item[1], reverse=True)),
            repeat_views=repeat_views,
            heatmap=heatmap,
            daily_distribution=daily_distribution,
            shorts_share=round(shorts_share, 3),
            daily_average_minutes=round(daily_average_minutes, 2),
            weekly_minutes=round(weekly_minutes, 2),
            session_distribution=session_distribution,
            longest_session_minutes=round(longest_session_minutes, 2),
            shorts_total_minutes=round(shorts_total_minutes, 2),
            algorithmic_minutes=round(algorithmic_minutes, 2),
            intentional_minutes=round(intentional_minutes, 2),
        )

    def _build_sessions(self, user_id: str, events: List[WatchEvent]) -> List[WatchSession]:
        sessions: List[WatchSession] = []
        current_session: Optional[WatchSession] = None
        previous_event: Optional[WatchEvent] = None

        for event in events:
            if not current_session:
                current_session = WatchSession(
                    user_id=user_id,
                    start_time=event.watched_at,
                    end_time=event.watched_at,
                    event_ids=[event.video_id],
                    video_ids=[event.video_id],
                    shorts_count=1 if event.is_short else 0,
                    total_events=1,
                    estimated_duration_seconds=DEFAULT_EVENT_DURATION_SECONDS
                )
                previous_event = event
                continue

            assert current_session is not None
            gap = event.watched_at - previous_event.watched_at
            if gap > SESSION_INACTIVITY_THRESHOLD:
                sessions.append(current_session)
                current_session = WatchSession(
                    user_id=user_id,
                    start_time=event.watched_at,
                    end_time=event.watched_at,
                    event_ids=[event.video_id],
                    video_ids=[event.video_id],
                    shorts_count=1 if event.is_short else 0,
                    total_events=1,
                    estimated_duration_seconds=DEFAULT_EVENT_DURATION_SECONDS,
                )
            else:
                current_session.end_time = event.watched_at
                current_session.event_ids.append(event.video_id)
                current_session.video_ids.append(event.video_id)
                current_session.total_events += 1
                if event.is_short:
                    current_session.shorts_count += 1

                gap_seconds = max(
                    DEFAULT_EVENT_DURATION_SECONDS,
                    min(int(gap.total_seconds()), MAX_GAP_CONTRIBUTION_SECONDS),
                )
                current_session.estimated_duration_seconds += gap_seconds

            previous_event = event

        if current_session:
            sessions.append(current_session)
        return sessions

    def _average_shorts_streak(self, events: List[WatchEvent]) -> float:
        longest_streak_seconds = []
        current_streak = 0

        # Iterate newest -> oldest to capture natural flow
        for event in events:
            if event.is_short:
                current_streak += SHORT_ESTIMATED_SECONDS
            else:
                if current_streak:
                    longest_streak_seconds.append(current_streak)
                current_streak = 0
        if current_streak:
            longest_streak_seconds.append(current_streak)

        if not longest_streak_seconds:
            return 0.0
        return sum(longest_streak_seconds) / len(longest_streak_seconds) / 60

    def _repeat_views(self, events: List[WatchEvent]) -> List[RepeatView]:
        occurrences: Dict[str, List[WatchEvent]] = defaultdict(list)
        for event in events:
            occurrences[event.video_id].append(event)

        repeated = [
            RepeatView(
                video_id=video_id,
                title=items[0].title,
                channel_title=items[0].channel_title,
                watch_count=len(items),
                last_watched_at=max(item.watched_at for item in items),
            )
            for video_id, items in occurrences.items()
            if len(items) > 1
        ]

        repeated.sort(key=lambda item: (item.watch_count, item.last_watched_at), reverse=True)
        return repeated[:10]

    def _build_heatmap(self, events: List[WatchEvent]) -> Dict[str, Dict[str, int]]:
        heatmap: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        for event in events:
            weekday = str(event.watched_at.weekday())
            hour = str(event.watched_at.hour)
            heatmap[weekday][hour] += 1
        return {day: dict(hours) for day, hours in heatmap.items()}

    def _daily_distribution(self, events: List[WatchEvent]) -> Dict[str, int]:
        counts: Counter[str] = Counter()
        for event in events:
            counts[event.watched_at.date().isoformat()] += 1
        return dict(counts)

    def _session_distribution(self, sessions: List[WatchSession]) -> Dict[str, int]:
        distribution: Dict[str, int] = defaultdict(int)
        for session in sessions:
            duration_minutes = session.estimated_duration_seconds / 60
            for label, lower, upper in SESSION_DURATION_BUCKETS:
                if duration_minutes < lower:
                    continue
                if upper is None or duration_minutes < upper:
                    distribution[label] += 1
                    break
        # Ensure all buckets present to keep UI stable
        for label, _lower, _upper in SESSION_DURATION_BUCKETS:
            distribution.setdefault(label, 0)
        return dict(distribution)

    def serialise_events(self, events: List[WatchEvent]) -> List[Dict[str, Any]]:
        serialised: List[Dict[str, Any]] = []
        for event in events:
            payload = asdict(event)
            payload["watched_at"] = event.watched_at.isoformat()
            serialised.append(payload)
        return serialised
