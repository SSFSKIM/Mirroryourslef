from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from app.libs import kv_store

from app.libs.watch_history_models import WatchHistoryAnalytics, WatchEvent


class WatchHistoryStorage:
    """Databutton storage manager for watch history artefacts."""

    EVENTS_KEY_TEMPLATE = "watch_history_events_{user_id}"
    ANALYTICS_KEY_TEMPLATE = "watch_history_analytics_{user_id}"
    STATUS_KEY_TEMPLATE = "watch_history_status_{user_id}"

    async def store_events(self, user_id: str, events: List[Dict[str, Any]]) -> bool:
        try:
            storage_key = self.EVENTS_KEY_TEMPLATE.format(user_id=user_id)
            payload = {
                "events": events,
                "total_count": len(events),
                "last_updated": datetime.now().isoformat(),
            }
            kv_store.put_json(storage_key, payload)
            return True
        except Exception as exc:  # pragma: no cover - defensive logging
            print(f"Failed to store watch history events for {user_id}: {exc}")
            return False

    async def get_events(self, user_id: str) -> List[Dict[str, Any]]:
        storage_key = self.EVENTS_KEY_TEMPLATE.format(user_id=user_id)
        try:
            payload = kv_store.get_json(storage_key, default={})
            return payload.get("events", [])
        except Exception as exc:
            print(f"Failed to fetch watch history events for {user_id}: {exc}")
            return []

    async def store_analytics(self, analytics: WatchHistoryAnalytics) -> bool:
        try:
            storage_key = self.ANALYTICS_KEY_TEMPLATE.format(user_id=analytics.user_id)
            repeat_views_payload = [
                {
                    "video_id": item.video_id,
                    "title": item.title,
                    "channel_title": item.channel_title,
                    "watch_count": item.watch_count,
                    "last_watched_at": item.last_watched_at.isoformat(),
                }
                for item in analytics.repeat_views
            ]

            payload = {
                "user_id": analytics.user_id,
                "generated_at": analytics.generated_at.isoformat(),
                "total_events": analytics.total_events,
                "unique_videos": analytics.unique_videos,
                "unique_channels": analytics.unique_channels,
                "average_session_duration_minutes": analytics.average_session_duration_minutes,
                "average_videos_per_session": analytics.average_videos_per_session,
                "average_shorts_streak_minutes": analytics.average_shorts_streak_minutes,
                "algorithmic_view_share": analytics.algorithmic_view_share,
                "intentional_view_share": analytics.intentional_view_share,
                "recommendation_breakdown": analytics.recommendation_breakdown,
                "repeat_views": repeat_views_payload,
                "heatmap": analytics.heatmap,
                "daily_distribution": analytics.daily_distribution,
                "shorts_share": analytics.shorts_share,
                "daily_average_minutes": analytics.daily_average_minutes,
                "weekly_minutes": analytics.weekly_minutes,
                "session_distribution": analytics.session_distribution,
                "longest_session_minutes": analytics.longest_session_minutes,
                "shorts_total_minutes": analytics.shorts_total_minutes,
                "algorithmic_minutes": analytics.algorithmic_minutes,
                "intentional_minutes": analytics.intentional_minutes,
            }

            kv_store.put_json(storage_key, payload)
            return True
        except Exception as exc:  # pragma: no cover
            print(f"Failed to store watch history analytics for {analytics.user_id}: {exc}")
            return False

    async def get_analytics(self, user_id: str) -> Optional[Dict[str, Any]]:
        storage_key = self.ANALYTICS_KEY_TEMPLATE.format(user_id=user_id)
        try:
            return kv_store.get_json(storage_key, default=None)
        except Exception as exc:
            print(f"Failed to fetch watch history analytics for {user_id}: {exc}")
            return None

    async def store_status(self, user_id: str, status: Dict[str, Any]) -> bool:
        try:
            storage_key = self.STATUS_KEY_TEMPLATE.format(user_id=user_id)
            payload = {**status, "updated_at": datetime.now().isoformat()}
            kv_store.put_json(storage_key, payload)
            return True
        except Exception as exc:
            print(f"Failed to store watch history status for {user_id}: {exc}")
            return False

    async def get_status(self, user_id: str) -> Dict[str, Any]:
        storage_key = self.STATUS_KEY_TEMPLATE.format(user_id=user_id)
        try:
            return kv_store.get_json(
                storage_key,
                default={
                    "last_uploaded_at": None,
                    "total_events": 0,
                    "processing_state": "idle",
                },
            )
        except Exception as exc:
            print(f"Failed to fetch watch history status for {user_id}: {exc}")
            return {
                "last_uploaded_at": None,
                "total_events": 0,
                "processing_state": "error",
            }

    async def delete_history(self, user_id: str) -> bool:
        try:
            events_key = self.EVENTS_KEY_TEMPLATE.format(user_id=user_id)
            analytics_key = self.ANALYTICS_KEY_TEMPLATE.format(user_id=user_id)
            status_key = self.STATUS_KEY_TEMPLATE.format(user_id=user_id)

            # Overwrite with empty payloads to honour "process and delete"
            kv_store.put_json(events_key, {"events": [], "total_count": 0, "last_updated": None})
            kv_store.put_json(analytics_key, {})
            kv_store.put_json(
                status_key,
                {
                    "last_uploaded_at": None,
                    "total_events": 0,
                    "processing_state": "idle",
                    "updated_at": datetime.now().isoformat(),
                },
            )
            return True
        except Exception as exc:
            print(f"Failed to delete watch history for {user_id}: {exc}")
            return False
