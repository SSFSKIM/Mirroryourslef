import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  getDocs,
  DocumentData
} from "firebase/firestore";

// Import db from centralized database module
import { db } from "./database";

// Collection names - centralized for consistency
export const COLLECTIONS = {
  USERS: "users",
  WATCH_SESSIONS: "watchSessions",
  VIDEO_STATS: "videoStats",
  USER_PREFERENCES: "userPreferences",
};

// Type definitions for our database schema

// User profile data
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  totalWatchTime: number; // in seconds
  dataLastSynced?: Timestamp;
}

// Video statistics data
export interface VideoStats {
  id: string; // Usually videoId from YouTube
  userId: string; // Reference to the user
  title: string;
  channelId: string;
  channelTitle: string;
  category: string;
  videoLength: number; // in seconds
  watchCount: number;
  totalWatchTime: number; // in seconds
  watchThroughPercentage: number; // 0-100
  isShort: boolean;
  thumbnailUrl?: string;
  lastWatched: Timestamp;
  firstWatched: Timestamp;
}

// Watch session data (a single viewing instance)
export interface WatchSession {
  id: string;
  userId: string;
  videoId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in seconds
  watchedPercentage: number; // 0-100
  deviceType: string; // mobile, desktop, tv, etc.
  isShort: boolean;
}

// User preferences for notifications, sharing, etc.
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ko';
  goalWatchTime: number; // daily watch time goal in minutes
  sharingEnabled: boolean;
  sharingScope: 'public' | 'followers' | 'private';
  autoShareExceededGoal: boolean;
  notificationsEnabled: boolean;
  enabledIntegrations: string[]; // ['instagram', 'facebook', etc.]
}

// Aggregated watch data by time period
export interface WatchTimeAggregation {
  userId: string;
  date: string; // YYYY-MM-DD format
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  totalWatchTime: number; // in seconds
  shortsTotalWatchTime: number; // in seconds
  shortsTotalCount: number;
  regularTotalCount: number;
}

// User database operations

/**
 * Create or update a user profile in Firestore
 */
export async function createOrUpdateUser(userData: UserProfile): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
  
  try {
    // Check if user exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        lastLogin: Timestamp.now()
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        totalWatchTime: 0
      });
      
      // Also initialize user preferences
      await setDoc(doc(db, COLLECTIONS.USER_PREFERENCES, userData.uid), {
        userId: userData.uid,
        theme: 'dark',
        language: 'en',
        goalWatchTime: 120, // 2 hours default
        sharingEnabled: false,
        sharingScope: 'private',
        autoShareExceededGoal: false,
        notificationsEnabled: true,
        enabledIntegrations: []
      });
    }
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
}

/**
 * Get a user's profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Subscribe to a user's profile in real-time
 */
export function subscribeToUserProfile(userId: string, callback: (user: UserProfile | null) => void): () => void {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error in user profile subscription:", error);
    callback(null);
  });
}

/**
 * Get a user's preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefsDoc = await getDoc(doc(db, COLLECTIONS.USER_PREFERENCES, userId));
    
    if (prefsDoc.exists()) {
      return prefsDoc.data() as UserPreferences;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user preferences:", error);
    throw error;
  }
}

/**
 * Update a user's preferences
 */
export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.USER_PREFERENCES, userId), preferences);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
}

/**
 * Subscribe to a user's preferences in real-time
 */
export function subscribeToUserPreferences(userId: string, callback: (prefs: UserPreferences | null) => void): () => void {
  const prefsRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
  
  return onSnapshot(prefsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserPreferences);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error in user preferences subscription:", error);
    callback(null);
  });
}

// Video statistics operations

/**
 * Store video statistics
 */
export async function storeVideoStats(videoStats: VideoStats): Promise<void> {
  try {
    // Use a compound ID to ensure uniqueness per user and video
    const statId = `${videoStats.userId}_${videoStats.id}`;
    await setDoc(doc(db, COLLECTIONS.VIDEO_STATS, statId), videoStats);
  } catch (error) {
    console.error("Error storing video stats:", error);
    throw error;
  }
}

/**
 * Store a watch session
 */
export async function storeWatchSession(session: WatchSession): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.WATCH_SESSIONS, session.id), session);
  } catch (error) {
    console.error("Error storing watch session:", error);
    throw error;
  }
}

/**
 * Get watch time data aggregated by hour and day
 */
export async function getWatchTimeHeatmap(userId: string): Promise<any[]> {
  try {
    const sessionsQuery = query(
      collection(db, COLLECTIONS.WATCH_SESSIONS),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(sessionsQuery);
    
    // Initialize empty heatmap data (7 days x 24 hours)
    const heatmap: {[key: string]: number} = {};
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap[`${day}_${hour}`] = 0;
      }
    }
    
    // Aggregate watch time by day and hour
    querySnapshot.forEach((doc) => {
      const session = doc.data() as WatchSession;
      const startDate = session.startTime.toDate();
      const day = startDate.getDay(); // 0-6 (Sunday-Saturday)
      const hour = startDate.getHours(); // 0-23
      
      heatmap[`${day}_${hour}`] += session.duration;
    });
    
    // Convert to array format for visualization
    const result = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        result.push({
          day,
          hour,
          value: heatmap[`${day}_${hour}`] / 60 // Convert to minutes
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error getting watch time heatmap:", error);
    throw error;
  }
}

/**
 * Get video length distribution
 */
export async function getVideoLengthDistribution(userId: string): Promise<any[]> {
  try {
    const statsQuery = query(
      collection(db, COLLECTIONS.VIDEO_STATS),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    // Create buckets for video lengths (0-60 minutes in 5-minute increments)
    const buckets: {[key: string]: number} = {};
    for (let i = 0; i <= 12; i++) {
      buckets[i.toString()] = 0;
    }
    
    querySnapshot.forEach((doc) => {
      const video = doc.data() as VideoStats;
      const lengthInMinutes = Math.floor(video.videoLength / 60);
      
      // Cap at 60 minutes
      const bucketIndex = Math.min(Math.floor(lengthInMinutes / 5), 12);
      buckets[bucketIndex.toString()] += video.watchCount;
    });
    
    // Convert to array format for visualization
    return Object.entries(buckets).map(([bucket, count]) => {
      const bucketIndex = parseInt(bucket);
      const minLength = bucketIndex * 5;
      const maxLength = bucketIndex === 12 ? 60 : (bucketIndex + 1) * 5;
      
      return {
        range: bucketIndex === 12 ? "60+" : `${minLength}-${maxLength}`,
        count,
      };
    });
  } catch (error) {
    console.error("Error getting video length distribution:", error);
    throw error;
  }
}

/**
 * Get average watch-through percentage
 */
export async function getAverageWatchThroughPercentage(userId: string): Promise<number> {
  try {
    const statsQuery = query(
      collection(db, COLLECTIONS.VIDEO_STATS),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    let totalPercentage = 0;
    let count = 0;
    
    querySnapshot.forEach((doc) => {
      const video = doc.data() as VideoStats;
      totalPercentage += video.watchThroughPercentage;
      count++;
    });
    
    return count > 0 ? Math.round(totalPercentage / count) : 0;
  } catch (error) {
    console.error("Error getting average watch-through percentage:", error);
    throw error;
  }
}

/**
 * Get top channels by watch time
 */
export async function getTopChannelsByWatchTime(userId: string, limit: number = 10): Promise<any[]> {
  try {
    // This would typically use aggregation, but for simplicity we'll query and process in code
    const statsQuery = query(
      collection(db, COLLECTIONS.VIDEO_STATS),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    const channels: {[key: string]: {channelId: string, channelTitle: string, totalWatchTime: number}} = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as VideoStats;
      if (!channels[data.channelId]) {
        channels[data.channelId] = {
          channelId: data.channelId,
          channelTitle: data.channelTitle,
          totalWatchTime: 0
        };
      }
      
      channels[data.channelId].totalWatchTime += data.totalWatchTime;
    });
    
    return Object.values(channels)
      .sort((a, b) => b.totalWatchTime - a.totalWatchTime)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top channels:", error);
    throw error;
  }
}

/**
 * Get category distribution
 */
export async function getCategoryDistribution(userId: string): Promise<any[]> {
  try {
    const statsQuery = query(
      collection(db, COLLECTIONS.VIDEO_STATS),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    
    const categories: {[key: string]: {category: string, totalWatchTime: number}} = {};
    let totalTime = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as VideoStats;
      totalTime += data.totalWatchTime;
      
      if (!categories[data.category]) {
        categories[data.category] = {
          category: data.category,
          totalWatchTime: 0
        };
      }
      
      categories[data.category].totalWatchTime += data.totalWatchTime;
    });
    
    // Convert to percentage
    return Object.values(categories).map(cat => ({
      category: cat.category,
      percentage: Math.round((cat.totalWatchTime / totalTime) * 100)
    }));
  } catch (error) {
    console.error("Error getting category distribution:", error);
    throw error;
  }
}

/**
 * Get shorts viewing statistics
 */
export async function getShortsStatistics(userId: string): Promise<{
  shortsPercentage: number;
  dailyAverageCount: number;
  weeklyAverageCount: number;
  averagePerSession: number;
}> {
  try {
    const videoStatsQuery = query(
      collection(db, COLLECTIONS.VIDEO_STATS),
      where("userId", "==", userId)
    );
    
    const sessionsQuery = query(
      collection(db, COLLECTIONS.WATCH_SESSIONS),
      where("userId", "==", userId)
    );
    
    const [videoSnapshot, sessionsSnapshot] = await Promise.all([
      getDocs(videoStatsQuery),
      getDocs(sessionsQuery)
    ]);
    
    let totalWatchTime = 0;
    let shortsWatchTime = 0;
    let totalShortsCount = 0;
    let totalShortsSessions = 0;
    let uniqueDays = new Set();
    
    // Process video stats
    videoSnapshot.forEach((doc) => {
      const data = doc.data() as VideoStats;
      totalWatchTime += data.totalWatchTime;
      
      if (data.isShort) {
        shortsWatchTime += data.totalWatchTime;
        totalShortsCount += data.watchCount;
      }
    });
    
    // Process sessions to get unique days and sessions
    const sessionsByDay: {[key: string]: number} = {};
    
    sessionsSnapshot.forEach((doc) => {
      const data = doc.data() as WatchSession;
      
      if (data.isShort) {
        totalShortsSessions++;
        
        const day = data.startTime.toDate().toISOString().split('T')[0];
        uniqueDays.add(day);
        
        if (!sessionsByDay[day]) {
          sessionsByDay[day] = 0;
        }
        
        sessionsByDay[day]++;
      }
    });
    
    const numDays = uniqueDays.size || 1; // Avoid division by zero
    const shortsPercentage = totalWatchTime > 0 ? Math.round((shortsWatchTime / totalWatchTime) * 100) : 0;
    const dailyAverageCount = Math.round(totalShortsCount / numDays);
    const weeklyAverageCount = dailyAverageCount * 7;
    const averagePerSession = totalShortsSessions > 0 ? Math.round(totalShortsCount / totalShortsSessions) : 0;
    
    return {
      shortsPercentage,
      dailyAverageCount,
      weeklyAverageCount,
      averagePerSession
    };
  } catch (error) {
    console.error("Error getting shorts statistics:", error);
    throw error;
  }
}

// Helper function to safely access nested properties
export function getNestedProperty(obj: any, path: string, defaultValue: any = null): any {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return defaultValue;
    }
    
    value = value[key];
  }
  
  return value === undefined ? defaultValue : value;
}
