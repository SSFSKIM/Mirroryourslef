/**
 * Database Schema Documentation
 * 
 * This file documents the Firestore schema and security rules for the MirrorYourself app.
 * It is intended as documentation only and is not used in the actual application.
 */

// Database Schema
export const DATABASE_SCHEMA = {
  /**
   * Collection: users
   * Document ID: {uid} (Firebase Auth UID)
   */
  users: {
    uid: 'string', // User's unique ID
    displayName: 'string | null', // User's display name
    email: 'string | null', // User's email
    photoURL: 'string | null', // User's profile photo URL
    createdAt: 'Timestamp', // When the user account was created
    lastLogin: 'Timestamp', // Last time the user logged in
    totalWatchTime: 'number', // Total watch time in seconds
    dataLastSynced: 'Timestamp', // When the data was last synced from YouTube
  },
  
  /**
   * Collection: userPreferences
   * Document ID: {uid} (Firebase Auth UID)
   */
  userPreferences: {
    userId: 'string', // Reference to user
    theme: "'light' | 'dark' | 'system'", // UI theme preference
    language: "'en' | 'ko'", // Language preference
    goalWatchTime: 'number', // Daily watch time goal in minutes
    sharingEnabled: 'boolean', // Whether sharing is enabled
    sharingScope: "'public' | 'followers' | 'private'", // Sharing permissions
    autoShareExceededGoal: 'boolean', // Auto-share when goal exceeded
    notificationsEnabled: 'boolean', // Whether notifications are enabled
    enabledIntegrations: 'string[]', // List of enabled integrations (e.g., ['instagram', 'facebook'])
  },
  
  /**
   * Collection: videoStats
   * Document ID: {userId}_{videoId} (Compound ID)
   */
  videoStats: {
    id: 'string', // YouTube video ID
    userId: 'string', // Reference to user
    title: 'string', // Video title
    channelId: 'string', // YouTube channel ID
    channelTitle: 'string', // Channel name
    category: 'string', // Video category (e.g., "Music", "Gaming")
    videoLength: 'number', // Video length in seconds
    watchCount: 'number', // Number of times the video was watched
    totalWatchTime: 'number', // Total time spent watching in seconds
    watchThroughPercentage: 'number', // Average percentage watched (0-100)
    isShort: 'boolean', // Whether the video is a YouTube Short
    thumbnailUrl: 'string', // URL to video thumbnail
    lastWatched: 'Timestamp', // When the video was last watched
    firstWatched: 'Timestamp', // When the video was first watched
  },
  
  /**
   * Collection: watchSessions
   * Document ID: {unique_id} (Generated ID)
   */
  watchSessions: {
    id: 'string', // Unique session ID
    userId: 'string', // Reference to user
    videoId: 'string', // YouTube video ID
    startTime: 'Timestamp', // When the session started
    endTime: 'Timestamp', // When the session ended
    duration: 'number', // Session duration in seconds
    watchedPercentage: 'number', // Percentage of video watched (0-100)
    deviceType: 'string', // Device type (e.g., "mobile", "desktop")
    isShort: 'boolean', // Whether it was a YouTube Short
  },
};

// Sample Firestore Security Rules
export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Basic rule - deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // User profiles - users can read/write their own data only
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent deletion of user profiles
    }
    
    // User preferences - users can read/write their own preferences only
    match /userPreferences/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Video statistics - users can read/write their own video stats only
    match /videoStats/{statId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
      allow update: if isOwner(resource.data.userId) && isOwner(request.resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Watch sessions - users can read/write their own watch sessions only
    match /watchSessions/{sessionId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
      allow update: if isOwner(resource.data.userId) && isOwner(request.resource.data.userId);
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Allow sharing of stats based on user's sharing preferences
    match /videoStats/{statId} {
      // Allow reading if the owner has set their profile to public or the reader is a follower
      allow read: if 
        resource.data.userId != request.auth.uid && 
        get(/databases/$(database)/documents/userPreferences/$(resource.data.userId)).data.sharingScope == "public";
    }
    
    // Admin access for maintenance
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
`;

/**
 * Notes on Implementing Security Rules
 * 
 * To implement these rules in Firebase:
 * 1. Go to the Firebase Console
 * 2. Navigate to Firestore Database
 * 3. Select the "Rules" tab
 * 4. Copy and paste the rules above
 * 5. Click "Publish"
 * 
 * These rules should be thoroughly tested before deployment to ensure they work as expected.
 */
