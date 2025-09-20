from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.auth import AuthorizedUser
from app.libs.watch_history_models import WatchEvent
from app.libs.watch_history_processor import WatchHistoryProcessor
from app.libs.watch_history_storage import WatchHistoryStorage

router = APIRouter()
storage = WatchHistoryStorage()
processor = WatchHistoryProcessor()


class WatchHistoryStatusResponse(BaseModel):
    last_uploaded_at: Optional[str]
    total_events: int
    processing_state: str
    updated_at: Optional[str]


class WatchHistoryAnalyticsResponse(BaseModel):
    user_id: str
    generated_at: str
    total_events: int
    unique_videos: int
    unique_channels: int
    average_session_duration_minutes: float
    average_videos_per_session: float
    average_shorts_streak_minutes: float
    algorithmic_view_share: float
    intentional_view_share: float
    recommendation_breakdown: Dict[str, int] = Field(default_factory=dict)
    repeat_views: list = Field(default_factory=list)
    heatmap: Dict[str, Dict[str, int]] = Field(default_factory=dict)
    daily_distribution: Dict[str, int] = Field(default_factory=dict)
    shorts_share: float
    daily_average_minutes: float
    weekly_minutes: float
    session_distribution: Dict[str, int] = Field(default_factory=dict)
    longest_session_minutes: float = 0.0
    shorts_total_minutes: float = 0.0
    algorithmic_minutes: float = 0.0
    intentional_minutes: float = 0.0


class UploadResponse(BaseModel):
    success: bool
    message: str
    events_processed: int
    analytics_generated: bool


class DeleteResponse(BaseModel):
    success: bool
    message: str


@router.get("/status", response_model=WatchHistoryStatusResponse)
async def get_watch_history_status(user: AuthorizedUser) -> WatchHistoryStatusResponse:
    """Retrieve current ingest status for uploaded watch history."""
    print(f"Getting watch history status for user {user.sub}")
    
    status = await storage.get_status(user.sub)
    return WatchHistoryStatusResponse(
        last_uploaded_at=status.get("last_uploaded_at"),
        total_events=status.get("total_events", 0),
        processing_state=status.get("processing_state", "idle"),
        updated_at=status.get("updated_at")
    )


@router.get("/analytics", response_model=WatchHistoryAnalyticsResponse)
async def get_watch_history_analytics(user: AuthorizedUser) -> WatchHistoryAnalyticsResponse:
    """Retrieve stored watch history analytics."""
    print(f"Getting watch history analytics for user {user.sub}")
    
    analytics_data = await storage.get_analytics(user.sub)
    if not analytics_data:
        raise HTTPException(status_code=404, detail="No analytics data found. Please upload watch history first.")

    analytics_data.setdefault("recommendation_breakdown", {})
    analytics_data.setdefault("repeat_views", [])
    analytics_data.setdefault("heatmap", {})
    analytics_data.setdefault("daily_distribution", {})
    analytics_data.setdefault("session_distribution", {})
    analytics_data.setdefault("longest_session_minutes", 0.0)
    analytics_data.setdefault("shorts_total_minutes", 0.0)
    analytics_data.setdefault("algorithmic_minutes", 0.0)
    analytics_data.setdefault("intentional_minutes", 0.0)

    return WatchHistoryAnalyticsResponse(**analytics_data)


@router.post("/upload-takeout", response_model=UploadResponse)
async def upload_watch_history_takeout(user: AuthorizedUser, file: UploadFile = File(...)) -> UploadResponse:
    """Upload a Google Takeout file to ingest watch history."""
    print(f"Processing watch history upload for user {user.sub}, filename: {file.filename}")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    if not (file.filename.endswith('.json') or file.filename.endswith('.zip')):
        raise HTTPException(status_code=400, detail="File must be a JSON or ZIP file")
    
    try:
        # Update status to processing
        await storage.store_status(user.sub, {
            "processing_state": "processing",
            "last_uploaded_at": datetime.now().isoformat()
        })
        
        # Read file content
        file_content = await file.read()
        
        # Parse the takeout file
        events = processor.parse_takeout(user.sub, file_content, file.filename)
        print(f"Parsed {len(events)} events from {file.filename}")
        
        if not events:
            await storage.store_status(user.sub, {
                "processing_state": "error",
                "total_events": 0
            })
            raise HTTPException(status_code=400, detail="No valid watch events found in the uploaded file")
        
        # Store events
        serialized_events = processor.serialise_events(events)
        events_stored = await storage.store_events(user.sub, serialized_events)
        
        if not events_stored:
            await storage.store_status(user.sub, {
                "processing_state": "error",
                "total_events": 0
            })
            raise HTTPException(status_code=500, detail="Failed to store watch events")
        
        # Generate analytics
        analytics = processor.compute_analytics(user.sub, events)
        analytics_stored = await storage.store_analytics(analytics)
        
        # Update final status
        await storage.store_status(user.sub, {
            "processing_state": "completed",
            "total_events": len(events),
            "last_uploaded_at": datetime.now().isoformat()
        })
        
        print(f"Successfully processed {len(events)} events and generated analytics for user {user.sub}")
        
        return UploadResponse(
            success=True,
            message=f"Successfully processed {len(events)} watch events",
            events_processed=len(events),
            analytics_generated=analytics_stored
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing watch history for user {user.sub}: {str(e)}")
        await storage.store_status(user.sub, {
            "processing_state": "error",
            "total_events": 0
        })
        raise HTTPException(status_code=500, detail=f"Failed to process watch history: {str(e)}")


@router.delete("/data", response_model=DeleteResponse)
async def delete_watch_history(user: AuthorizedUser) -> DeleteResponse:
    """Delete stored watch history events and analytics."""
    print(f"Deleting watch history data for user {user.sub}")
    
    try:
        success = await storage.delete_history(user.sub)
        
        if success:
            return DeleteResponse(
                success=True,
                message="Watch history data deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete watch history data")
            
    except Exception as e:
        print(f"Error deleting watch history for user {user.sub}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete watch history: {str(e)}")
