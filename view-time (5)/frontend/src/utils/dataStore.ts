

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

const isJsonContentType = (contentType: string | null) =>
  typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');

const buildHttpError = async (response: Response, context: string): Promise<Error> => {
  let message = `${context} (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''})`;

  try {
    const clone = response.clone();
    const contentType = clone.headers.get('content-type');

    if (isJsonContentType(contentType)) {
      const data = await clone.json();
      const detail = (data?.detail ?? data?.error ?? data?.message) as string | undefined;
      if (detail) {
        message += ` – ${detail}`;
      }
    } else {
      const preview = (await clone.text()).trim();
      if (preview) {
        message += ` – ${preview.slice(0, 180)}`;
      }
    }
  } catch (parseError) {
    console.warn('Failed to inspect error response payload', parseError);
  }

  return new Error(message);
};

const normaliseFetchError = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (/failed to fetch/i.test(error.message) || /network/i.test(error.message)) {
      return `${fallback}: backend unreachable. Ensure the FastAPI server is running on port 8000.`;
    }
    return `${fallback}: ${error.message}`;
  }
  return fallback;
};

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

interface CategorySegment {
  category: string;
  count: number;
  percentage: number;
  totalWatchTime: number;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildCategoryBreakdown = (payload: any): CategorySegment[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const analyticsBlock = payload.analytics && typeof payload.analytics === 'object'
    ? payload.analytics
    : {};

  const directBreakdown = Array.isArray(analyticsBlock.category_breakdown)
    ? analyticsBlock.category_breakdown
    : Array.isArray(payload.categoryBreakdown)
      ? payload.categoryBreakdown
      : [];

  if (directBreakdown.length > 0) {
    return directBreakdown
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const category = typeof entry.category === 'string' ? entry.category : 'Other';
        const count = toNumber(entry.count);
        const percentage = toNumber(entry.percentage);
        const totalWatchTime = toNumber(entry.total_watch_time ?? entry.totalWatchTime);
        return {
          category,
          count,
          percentage,
          totalWatchTime,
        } as CategorySegment;
      })
      .filter((entry): entry is CategorySegment => Boolean(entry && entry.count > 0))
      .sort((a, b) => b.count - a.count);
  }

  const categoryStats = analyticsBlock.category_stats && typeof analyticsBlock.category_stats === 'object'
    ? analyticsBlock.category_stats
    : {};

  const counts = categoryStats.category_counts && typeof categoryStats.category_counts === 'object'
    ? categoryStats.category_counts
    : {};
  const percentages = categoryStats.category_percentages && typeof categoryStats.category_percentages === 'object'
    ? categoryStats.category_percentages
    : {};
  const durations = categoryStats.category_total_duration && typeof categoryStats.category_total_duration === 'object'
    ? categoryStats.category_total_duration
    : {};

  const countEntries = Object.entries(counts);
  if (countEntries.length === 0) {
    return [];
  }

  const totalCount = countEntries.reduce((acc, [, value]) => acc + toNumber(value), 0) || 1;

  return countEntries
    .map(([category, rawCount]) => {
      const count = toNumber(rawCount);
      const totalWatchTime = toNumber(durations[category]);
      const percentageSource = toNumber(percentages[category]);
      const calculatedPercentage = (count / totalCount) * 100;
      return {
        category,
        count,
        percentage: percentageSource > 0 ? percentageSource : calculatedPercentage,
        totalWatchTime,
      } as CategorySegment;
    })
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
};

const normalizeAnalyticsPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  // Extract the analytics block (which contains the actual data)
  const analyticsBlock = payload.analytics && typeof payload.analytics === 'object'
    ? { ...payload.analytics }
    : {};

  // Flatten the structure - merge top-level fields with analytics block
  const normalized = {
    ...payload,
    ...analyticsBlock, // Spread the analytics data to top level
    analytics: analyticsBlock, // Keep original for backward compatibility
  } as any;

  // Build and add category breakdown
  const breakdown = buildCategoryBreakdown(normalized);
  normalized.categoryBreakdown = breakdown;
  if (normalized.analytics) {
    normalized.analytics.category_breakdown = breakdown;
  }

  return normalized;
};

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
          await get().loadSyncStatus();
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
    const { user, isSyncStatusLoading } = get();

    if (!user) {
      set({
        syncStatus: null,
        isSyncStatusLoading: false,
        syncStatusError: null,
      });
      return;
    }

    if (isSyncStatusLoading) {
      return;
    }

    set({ isSyncStatusLoading: true, syncStatusError: null });

    try {
      const response = await brain.get_sync_status();
      if (!response.ok) {
        throw await buildHttpError(response, 'Failed to load sync status');
      }

      let status: SyncStatus;
      try {
        status = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse sync status response as JSON.');
      }

      set({ syncStatus: status });

      const desiredSampleSize =
        status?.sample_size ?? status?.sampleSize ?? status?.preferred_sample_size ?? 100;
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
      const message = normaliseFetchError(error, 'Failed to load sync status');
      set({ syncStatusError: new Error(message) });
    } finally {
      set({ isSyncStatusLoading: false });
    }
  },
  
  // Load analytics data
  loadAnalytics: async (sampleSize?: number) => {
    const { user, syncStatus, analyticsSampleSize: currentSampleSize, isAnalyticsLoading, analytics } = get();

    if (!user) {
      set({
        analytics: null,
        isAnalyticsLoading: false,
        analyticsError: null,
      });
      return;
    }

    if (isAnalyticsLoading) {
      return;
    }

    const desiredSampleSize = sampleSize
      ?? syncStatus?.sample_size
      ?? syncStatus?.sampleSize
      ?? syncStatus?.preferred_sample_size
      ?? currentSampleSize
      ?? 100;

    if (analytics && currentSampleSize === desiredSampleSize) {
      return;
    }

    set({ isAnalyticsLoading: true, analyticsError: null });

    try {
      const response = await brain.get_analytics({ sample_size: desiredSampleSize });
      if (!response.ok) {
        throw await buildHttpError(response, 'Failed to load analytics');
      }

      const analyticsPayload = await response.json();
      const normalizedPayload = normalizeAnalyticsPayload(analyticsPayload);
      set({
        analytics: normalizedPayload,
        analyticsSampleSize: desiredSampleSize,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      const message = normaliseFetchError(error, 'Failed to load analytics');
      set({ analyticsError: new Error(message) });
    } finally {
      set({ isAnalyticsLoading: false });
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
      await get().loadSyncStatus();
      await get().loadAnalytics();
    } catch (error) {
      console.error('Error refreshing data:', error);
      const message = normaliseFetchError(error, 'Failed to refresh analytics data');
      set({
        syncStatusError: new Error(message),
        analyticsError: new Error(message),
      });
    }
  },
  
}));

export default useDataStore;
