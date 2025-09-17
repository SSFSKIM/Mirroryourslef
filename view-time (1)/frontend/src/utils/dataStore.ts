import { create } from 'zustand';
import { firebaseAuth } from 'app';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  UserProfile,
  UserPreferences,
  createOrUpdateUser,
  getUserProfile,
  updateUserPreferences,
  getUserPreferences,
  subscribeToUserProfile,
  subscribeToUserPreferences,
  getTopChannelsByWatchTime,
  getCategoryDistribution,
  getShortsStatistics,
  getWatchTimeHeatmap,
  getVideoLengthDistribution,
  getAverageWatchThroughPercentage
} from './firestore';
import { Timestamp } from 'firebase/firestore';

// Types for our data store
type DataState = {
  // User data
  user: User | null;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  
  // Analytics data
  topChannels: any[] | null;
  categoryDistribution: any[] | null;
  shortsStatistics: {
    shortsPercentage: number;
    dailyAverageCount: number;
    weeklyAverageCount: number;
    averagePerSession: number;
  } | null;
  watchTimeHeatmap: any[] | null;
  videoLengthDistribution: any[] | null;
  averageWatchThroughPercentage: number | null;
  
  // Loading states
  isUserLoading: boolean;
  isProfileLoading: boolean;
  isPreferencesLoading: boolean;
  isTopChannelsLoading: boolean;
  isCategoryDistributionLoading: boolean;
  isShortsStatisticsLoading: boolean;
  isWatchTimeHeatmapLoading: boolean;
  isVideoLengthDistributionLoading: boolean;
  isAverageWatchThroughLoading: boolean;
  
  // Error states
  userError: Error | null;
  profileError: Error | null;
  preferencesError: Error | null;
  topChannelsError: Error | null;
  categoryDistributionError: Error | null;
  shortsStatisticsError: Error | null;
  watchTimeHeatmapError: Error | null;
  videoLengthDistributionError: Error | null;
  averageWatchThroughError: Error | null;
  
  // Action methods
  initializeAuth: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  loadTopChannels: (limit?: number) => Promise<void>;
  loadCategoryDistribution: () => Promise<void>;
  loadShortsStatistics: () => Promise<void>;
  loadWatchTimeHeatmap: () => Promise<void>;
  loadVideoLengthDistribution: () => Promise<void>;
  loadAverageWatchThrough: () => Promise<void>;
};

const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  user: null,
  userProfile: null,
  userPreferences: null,
  topChannels: null,
  categoryDistribution: null,
  shortsStatistics: null,
  watchTimeHeatmap: null,
  videoLengthDistribution: null,
  averageWatchThroughPercentage: null,
  
  isUserLoading: true,
  isProfileLoading: false,
  isPreferencesLoading: false,
  isTopChannelsLoading: false,
  isCategoryDistributionLoading: false,
  isShortsStatisticsLoading: false,
  isWatchTimeHeatmapLoading: false,
  isVideoLengthDistributionLoading: false,
  isAverageWatchThroughLoading: false,
  
  userError: null,
  profileError: null,
  preferencesError: null,
  topChannelsError: null,
  categoryDistributionError: null,
  shortsStatisticsError: null,
  watchTimeHeatmapError: null,
  videoLengthDistributionError: null,
  averageWatchThroughError: null,
  
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
          get().loadTopChannels();
          get().loadCategoryDistribution();
          get().loadShortsStatistics();
          get().loadWatchTimeHeatmap();
          get().loadVideoLengthDistribution();
          get().loadAverageWatchThrough();
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
          topChannels: null,
          categoryDistribution: null,
          shortsStatistics: null,
          watchTimeHeatmap: null,
          videoLengthDistribution: null,
          averageWatchThroughPercentage: null,
          isProfileLoading: false,
          isPreferencesLoading: false,
          isWatchTimeHeatmapLoading: false,
          isVideoLengthDistributionLoading: false,
          isAverageWatchThroughLoading: false
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
      
      await updateUserPreferences(user.uid, preferences);
      
      // The subscribed listener will update the state
    } catch (error) {
      console.error('Error updating user preferences:', error);
      set({ preferencesError: error as Error, isPreferencesLoading: false });
      throw error;
    }
  },
  
  // Load top channels data
  loadTopChannels: async (limit = 20) => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isTopChannelsLoading: true, topChannelsError: null });
      
      const topChannels = await getTopChannelsByWatchTime(user.uid, limit);
      set({ topChannels, isTopChannelsLoading: false });
    } catch (error) {
      console.error('Error loading top channels:', error);
      set({ topChannelsError: error as Error, isTopChannelsLoading: false });
      throw error;
    }
  },
  
  // Load category distribution data
  loadCategoryDistribution: async () => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isCategoryDistributionLoading: true, categoryDistributionError: null });
      
      const distribution = await getCategoryDistribution(user.uid);
      set({ categoryDistribution: distribution, isCategoryDistributionLoading: false });
    } catch (error) {
      console.error('Error loading category distribution:', error);
      set({ 
        categoryDistributionError: error as Error, 
        isCategoryDistributionLoading: false 
      });
      throw error;
    }
  },
  
  // Load shorts statistics data
  loadShortsStatistics: async () => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isShortsStatisticsLoading: true, shortsStatisticsError: null });
      
      const stats = await getShortsStatistics(user.uid);
      set({ shortsStatistics: stats, isShortsStatisticsLoading: false });
    } catch (error) {
      console.error('Error loading shorts statistics:', error);
      set({ 
        shortsStatisticsError: error as Error, 
        isShortsStatisticsLoading: false 
      });
      throw error;
    }
  },
  
  // Load watch time heatmap data
  loadWatchTimeHeatmap: async () => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isWatchTimeHeatmapLoading: true, watchTimeHeatmapError: null });
      
      const heatmapData = await getWatchTimeHeatmap(user.uid);
      set({ watchTimeHeatmap: heatmapData, isWatchTimeHeatmapLoading: false });
    } catch (error) {
      console.error('Error loading watch time heatmap:', error);
      set({ 
        watchTimeHeatmapError: error as Error, 
        isWatchTimeHeatmapLoading: false 
      });
      throw error;
    }
  },
  
  // Load video length distribution data
  loadVideoLengthDistribution: async () => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isVideoLengthDistributionLoading: true, videoLengthDistributionError: null });
      
      const distributionData = await getVideoLengthDistribution(user.uid);
      set({ videoLengthDistribution: distributionData, isVideoLengthDistributionLoading: false });
    } catch (error) {
      console.error('Error loading video length distribution:', error);
      set({ 
        videoLengthDistributionError: error as Error, 
        isVideoLengthDistributionLoading: false 
      });
      throw error;
    }
  },
  
  // Load average watch-through percentage data
  loadAverageWatchThrough: async () => {
    const { user } = get();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      set({ isAverageWatchThroughLoading: true, averageWatchThroughError: null });
      
      const percentage = await getAverageWatchThroughPercentage(user.uid);
      set({ averageWatchThroughPercentage: percentage, isAverageWatchThroughLoading: false });
    } catch (error) {
      console.error('Error loading average watch-through percentage:', error);
      set({ 
        averageWatchThroughError: error as Error, 
        isAverageWatchThroughLoading: false 
      });
      throw error;
    }
  },
  
}));

export default useDataStore;