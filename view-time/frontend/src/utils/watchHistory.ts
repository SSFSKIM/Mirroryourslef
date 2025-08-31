/**
 * Utilities for handling YouTube watch history data
 */
import { Timestamp } from "firebase/firestore";
import { storeVideoStats, storeWatchSession, VideoStats, WatchSession } from "./firestore";

/**
 * Record a watch session for analytics
 * 
 * @param userId User ID from Firebase Auth
 * @param videoData Video data from YouTube API
 * @param watchDuration How long the user watched (in seconds)
 * @param deviceType Device type (mobile, desktop, etc.)
 */
export async function recordWatchSession(
  userId: string,
  videoData: {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    category?: string;
    duration: number; // in seconds
    isShort?: boolean;
    thumbnailUrl?: string;
  },
  watchDuration: number,
  deviceType: string = "unknown"
): Promise<void> {
  try {
    const now = Timestamp.now();
    const isShort = videoData.isShort || videoData.duration <= 60;
    
    // Calculate watch percentage (cap at 100%)
    const watchPercentage = Math.min(
      Math.round((watchDuration / videoData.duration) * 100),
      100
    );
    
    // Create watch session record
    const sessionId = `${userId}_${videoData.id}_${Date.now()}`;
    const watchSession: WatchSession = {
      id: sessionId,
      userId,
      videoId: videoData.id,
      startTime: Timestamp.fromMillis(now.toMillis() - (watchDuration * 1000)),
      endTime: now,
      duration: watchDuration,
      watchedPercentage: watchPercentage,
      deviceType,
      isShort
    };
    
    // Create or update video stats
    const statId = `${userId}_${videoData.id}`;
    
    // Get existing video stats if available
    // (This would typically be done with a transaction or batched write in production)
    let existingStats: VideoStats | null = null;
    
    try {
      // Try to get existing stats (code would be added here for a real implementation)
      // For now, we'll create new stats
    } catch (error) {
      // No existing stats found, create new
    }
    
    // Create new video stats if no existing stats found
    if (!existingStats) {
      const videoStats: VideoStats = {
        id: videoData.id,
        userId,
        title: videoData.title,
        channelId: videoData.channelId,
        channelTitle: videoData.channelTitle,
        category: videoData.category || "Uncategorized",
        videoLength: videoData.duration,
        watchCount: 1,
        totalWatchTime: watchDuration,
        watchThroughPercentage: watchPercentage,
        isShort,
        thumbnailUrl: videoData.thumbnailUrl,
        lastWatched: now,
        firstWatched: now
      };
      
      await storeVideoStats(videoStats);
    } else {
      // Update existing stats (in a real implementation)
      // This would update watch count, total time, etc.
    }
    
    // Store the watch session
    await storeWatchSession(watchSession);
    
    console.log(`Recorded watch session for video ${videoData.id}`);
  } catch (error) {
    console.error("Error recording watch session:", error);
    throw error;
  }
}

/**
 * Process watch history data from YouTube API
 * 
 * @param userId User ID from Firebase Auth
 * @param watchHistoryData Data from YouTube API
 */
export async function processWatchHistory(
  userId: string,
  watchHistoryData: any[]
): Promise<void> {
  try {
    for (const video of watchHistoryData) {
      // Extract essential data
      const videoData = {
        id: video.id,
        title: video.title,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        category: video.category || "Uncategorized",
        duration: video.videoLength,
        isShort: video.isShort,
        thumbnailUrl: video.thumbnailUrl
      };
      
      // Record a watch session for this video
      // We'll use the video length as an approximation of watch duration
      await recordWatchSession(
        userId,
        videoData,
        video.videoLength, // Approximation
        "unknown" // Device type unknown for historical data
      );
    }
    
    console.log(`Processed ${watchHistoryData.length} videos from watch history`);
  } catch (error) {
    console.error("Error processing watch history:", error);
    throw error;
  }
}
