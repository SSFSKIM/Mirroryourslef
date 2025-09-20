

import { create } from 'zustand';
import { firebaseAuth } from 'app';
import { onAuthStateChanged, User } from 'firebase/auth';
import brain from 'brain';
import {
  UserProfile,
  UserPreferences,
  createOrUpdateUser,
  subscribeToUserProfile,
  subscribeToUserPreferences,
} from './firestore';
import { Timestamp } from 'firebase/firestore';

// Types for liked videos analytics
interface LikedVideosAnalytics {
  totalVideos: number;
  uniqueChannels: number;
  shortsPercentage: number;
  avgDuration: number;
  categoryBreakdown: Array<{category: string, count: number}>;
  channelStats: {
    totalChannels: number;
    topChannels: Array<{channelName: string, videoCount: number}>;
  };
  keywordAnalysis: {
    topKeywords: Array<{keyword: string, frequency: number}>;
  };
  shortsAnalysis: {
    shortsPercentage: number;
    shortsCount: number;
    regularCount: number;
  };
  durationAnalysis: {
    averageDuration: number;
    distribution: any[];
  };
}

interface SyncStatus {
  lastSynced?: string;
  totalVideos: number;
  analyticsAvailable: boolean;
  sampleSize?: number;
  sample_size?: number;
  preferred_sample_size?: number;
}

// Types for our data store
type DataState = {
  // User data
  user: User | null;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  
  // Liked videos analytics data
  syncStatus: SyncStatus | null;
  analytics: any;
  analyticsSampleSize: number;
  
  // Loading states
  isUserLoading: boolean;
  isProfileLoading: boolean;
  isPreferencesLoading: boolean;
  isSyncStatusLoading: boolean;
  isAnalyticsLoading: boolean;
  
  // Error states
  userError: Error | null;
  profileError: Error | null;
  preferencesError: Error | null;
  syncStatusError: Error | null;
  analyticsError: Error | null;
  
  // Action methods
  initializeAuth: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  loadSyncStatus: () => Promise<void>;
  loadAnalytics: (sampleSize?: number) => Promise<void>;
  refreshData: () => Promise<void>;
};

const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  userPreferences: null,
  syncStatus: null,
  analytics: null,
  analyticsSampleSize: 100,
  
  isUserLoading: true,
  isProfileLoading: false,
  isPreferencesLoading: false,
  isSyncStatusLoading: false,
  isAnalyticsLoading: false,
  
  userError: null,
  profileError: null,
  preferencesError: null,
  syncStatusError: null,
  analyticsError: null,
  
  // Initialize authentication and subscriptions
  initializeAuth: async () => {
    set({ isUserLoading: true, userError: null });
    
    // Unsubscribers
    let profileUnsubscriber: (() => void) | null = null;
    let preferencesUnsubscriber: (() => void) | null = null;
    
    // Listen for auth state changes
    onAuthStateChanged(firebaseAuth, async (user) => {
      set({ user, isUserLoading: false });
      
      // Clean up previous subscriptions
      if (profileUnsubscriber) profileUnsubscriber();
      if (preferencesUnsubscriber) preferencesUnsubscriber();
      
      if (user) {
        try {
          // Create or update user profile
          const userProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: Timestamp.now(),
            lastLogin: Timestamp.now(),
            totalWatchTime: 0,
          };
          
          await createOrUpdateUser(userProfile);
          
          // Subscribe to user profile changes
          profileUnsubscriber = subscribeToUserProfile(user.uid, (profile) => {
            set({ userProfile: profile, isProfileLoading: false });
          });
          
          // Subscribe to user preferences changes
          preferencesUnsubscriber = subscribeToUserPreferences(user.uid, (prefs) => {
            set({ userPreferences: prefs, isPreferencesLoading: false });
          });
          
          // Load initial analytics data
          get().loadSyncStatus();
        } catch (error) {
          console.error('Error initializing user data:', error);
          set({ 
            profileError: error as Error,
            isProfileLoading: false,
            isPreferencesLoading: false 
          });
        }
      } else {
        // Reset user data when logged out
        set({
          userProfile: null,
          userPreferences: null,
          syncStatus: null,
          analytics: null,
          isProfileLoading: false,
          isPreferencesLoading: false,
          isSyncStatusLoading: false,
          isAnalyticsLoading: false
        });
      }
    });
  },
  
  // Update user profile
  updateUserProfile: async (profile: Partial<UserProfile>) => {
    const { user, userProfile } = get();
    
    if (!user || !userProfile) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isProfileLoading: true, profileError: null });
      
      const updatedProfile = { ...userProfile, ...profile };
      await createOrUpdateUser(updatedProfile as UserProfile);
      
      // The subscribed listener will update the state
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ profileError: error as Error, isProfileLoading: false });
      throw error;
    }
  },
  
  // Update user preferences
  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const { user, userPreferences } = get();
    
    if (!user || !userPreferences) {
      throw new Error('User not authenticated or preferences not loaded');
    }
    
    try {
      set({ isPreferencesLoading: true, preferencesError: null });
      
      await brain.updateUserPreferences(user.uid, preferences);
      
      // The subscribed listener will update the state
    } catch (error) {
      console.error('Error updating user preferences:', error);
      set({ preferencesError: error as Error, isPreferencesLoading: false });
      throw error;
    }
  },
  
  // Load sync status data
  loadSyncStatus: async () => {
    const { user } = get();

    if (!user) {
      set({
        syncStatus: null,
        isSyncStatusLoading: false,
        syncStatusError: null,
      });
      return;
    }
    
    try {
      set({ isSyncStatusLoading: true, syncStatusError: null });
      
      const response = await brain.get_sync_status();
      const status = await response.json();
      set({ syncStatus: status, isSyncStatusLoading: false });

      const desiredSampleSize = status?.sample_size
        ?? status?.sampleSize
        ?? status?.preferred_sample_size
        ?? 100;
      const currentSampleSize = get().analyticsSampleSize;
      const analyticsLoaded = get().analytics;

      if (!analyticsLoaded || currentSampleSize !== desiredSampleSize) {
        try {
          await get().loadAnalytics(desiredSampleSize);
        } catch (error) {
          console.error('Error loading analytics after sync status update:', error);
        }
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
      set({ 
        syncStatusError: error as Error, 
        isSyncStatusLoading: false 
      });
      throw error;
    }
  },
  
  // Load analytics data
  loadAnalytics: async (sampleSize?: number) => {
    const { user, syncStatus, analyticsSampleSize: currentSampleSize } = get();

    if (!user) {
      set({
        analytics: null,
        isAnalyticsLoading: false,
        analyticsError: null,
      });
      return;
    }
    
    const desiredSampleSize = sampleSize
      ?? syncStatus?.sample_size
      ?? syncStatus?.sampleSize
      ?? syncStatus?.preferred_sample_size
      ?? currentSampleSize
      ?? 100;
    
    try {
      set({ isAnalyticsLoading: true, analyticsError: null });
      
      const response = await brain.get_analytics({ sample_size: desiredSampleSize });
      const analytics = await response.json();
      set({ 
        analytics, 
        analyticsSampleSize: desiredSampleSize,
        isAnalyticsLoading: false 
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      set({ 
        analyticsError: error as Error, 
        isAnalyticsLoading: false 
      });
      throw error;
    }
  },
  
  // Refresh all data
  refreshData: async () => {
    const { user } = get();

    if (!user) {
      set({
        syncStatus: null,
        analytics: null,
        isSyncStatusLoading: false,
        isAnalyticsLoading: false,
        syncStatusError: null,
        analyticsError: null,
      });
      return;
    }
    
    try {
      set({
        isSyncStatusLoading: true,
        isAnalyticsLoading: true,
        syncStatusError: null,
        analyticsError: null
      });
      
      const statusResponse = await brain.get_sync_status();
      const status = await statusResponse.json();
      const desiredSampleSize = status?.sample_size
        ?? status?.sampleSize
        ?? status?.preferred_sample_size
        ?? 100;

      const analyticsResponse = await brain.get_analytics({ sample_size: desiredSampleSize });
      const analytics = await analyticsResponse.json();
      
      set({
        syncStatus: status,
        analytics,
        analyticsSampleSize: desiredSampleSize,
        isSyncStatusLoading: false,
        isAnalyticsLoading: false
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      set({
        syncStatusError: error as Error,
        analyticsError: error as Error,
        isSyncStatusLoading: false,
        isAnalyticsLoading: false
      });
      throw error;
    }
  },
  
}));

export default useDataStore;
