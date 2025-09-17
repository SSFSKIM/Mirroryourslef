/**
 * Firebase Firestore database initialization and utilities
 */
import { firebaseApp } from "app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase services
export const db = getFirestore(firebaseApp);

/**
 * Database Schema Documentation
 * 
 * This file documents the schema design for the MirrorYourself app's Firestore database.
 * 
 * Collections:
 * 
 * 1. users
 *    - Document ID: {uid} (Firebase Auth UID)
 *    - Fields:
 *      - uid: string - User's unique ID
 *      - displayName: string | null - User's display name
 *      - email: string | null - User's email
 *      - photoURL: string | null - User's profile photo URL
 *      - createdAt: Timestamp - When the user account was created
 *      - lastLogin: Timestamp - Last time the user logged in
 *      - totalWatchTime: number - Total watch time in seconds
 *      - dataLastSynced: Timestamp - When the data was last synced from YouTube
 * 
 * 2. userPreferences
 *    - Document ID: {uid} (Firebase Auth UID)
 *    - Fields:
 *      - userId: string - Reference to user
 *      - theme: 'light' | 'dark' | 'system' - UI theme preference
 *      - language: 'en' | 'ko' - Language preference
 *      - goalWatchTime: number - Daily watch time goal in minutes
 *      - sharingEnabled: boolean - Whether sharing is enabled
 *      - sharingScope: 'public' | 'followers' | 'private' - Sharing permissions
 *      - autoShareExceededGoal: boolean - Auto-share when goal exceeded
 *      - notificationsEnabled: boolean - Whether notifications are enabled
 *      - enabledIntegrations: string[] - List of enabled integrations (e.g., ['instagram', 'facebook'])
 * 
 * 3. videoStats
 *    - Document ID: {userId}_{videoId} (Compound ID)
 *    - Fields:
 *      - id: string - YouTube video ID
 *      - userId: string - Reference to user
 *      - title: string - Video title
 *      - channelId: string - YouTube channel ID
 *      - channelTitle: string - Channel name
 *      - category: string - Video category (e.g., "Music", "Gaming")
 *      - videoLength: number - Video length in seconds
 *      - watchCount: number - Number of times the video was watched
 *      - totalWatchTime: number - Total time spent watching in seconds
 *      - watchThroughPercentage: number - Average percentage watched (0-100)
 *      - isShort: boolean - Whether the video is a YouTube Short
 *      - thumbnailUrl: string - URL to video thumbnail
 *      - lastWatched: Timestamp - When the video was last watched
 *      - firstWatched: Timestamp - When the video was first watched
 * 
 * 4. watchSessions
 *    - Document ID: {unique_id} (Generated ID)
 *    - Fields:
 *      - id: string - Unique session ID
 *      - userId: string - Reference to user
 *      - videoId: string - YouTube video ID
 *      - startTime: Timestamp - When the session started
 *      - endTime: Timestamp - When the session ended
 *      - duration: number - Session duration in seconds
 *      - watchedPercentage: number - Percentage of video watched (0-100)
 *      - deviceType: string - Device type (e.g., "mobile", "desktop")
 *      - isShort: boolean - Whether it was a YouTube Short
 */

// Collection names exported from firestore.ts
export { COLLECTIONS } from "./firestore";
