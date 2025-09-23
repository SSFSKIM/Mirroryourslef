import { create } from "zustand";
import brain from "brain";
import type {
  DeleteWatchHistoryData,
  GetWatchHistoryAnalyticsData,
  GetWatchHistoryStatusData,
  UploadWatchHistoryTakeoutData,
} from "types";

type WatchHistoryStatus = GetWatchHistoryStatusData;

type WatchHistoryAnalytics = (GetWatchHistoryAnalyticsData & {
  session_distribution?: Record<string, number>;
  longest_session_minutes?: number;
  shorts_total_minutes?: number;
  algorithmic_minutes?: number;
  intentional_minutes?: number;
}) | null;

type WatchHistoryState = {
  status: WatchHistoryStatus | null;
  analytics: WatchHistoryAnalytics;
  isLoadingStatus: boolean;
  isLoadingAnalytics: boolean;
  isUploading: boolean;
  error: string | null;
  uploadMessage: string | null;
  lastUpdatedAt: string | null;
  lastAnalyticsAttemptAt: number | null;
  loadStatus: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  refresh: () => Promise<void>;
  uploadTakeout: (file: File) => Promise<void>;
  deleteHistory: () => Promise<void>;
};

const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  status: null,
  analytics: null,
  isLoadingStatus: false,
  isLoadingAnalytics: false,
  isUploading: false,
  error: null,
  uploadMessage: null,
  lastUpdatedAt: null,
  lastAnalyticsAttemptAt: null,

  loadStatus: async () => {
    set({ isLoadingStatus: true, error: null });
    try {
      const response = await brain.get_watch_history_status();
      if (!response.ok) {
        if (response.status === 404) {
          set({ status: null, isLoadingStatus: false });
          return;
        }
        throw new Error(`Failed to load watch history status (${response.status})`);
      }

      const statusData: GetWatchHistoryStatusData = await response.json();
      set({ status: statusData, isLoadingStatus: false });
    } catch (error) {
      console.error("Failed to load watch history status", error);
      set({ error: (error as Error).message, isLoadingStatus: false });
    }
  },

  loadAnalytics: async () => {
    set({ isLoadingAnalytics: true, error: null });
    try {
      // Throttle analytics fetch to avoid tight loops when data isn't ready
      const now = Date.now();
      const { lastAnalyticsAttemptAt, status } = get();

      // Only try to load analytics after we have events and processing completed
      const hasEvents = (status?.total_events ?? 0) > 0;
      const isReady = status?.processing_state === "completed";
      if (!hasEvents || !isReady) {
        set({ isLoadingAnalytics: false });
        return;
      }

      // If we tried very recently (e.g., within 5 seconds) skip to reduce noise
      if (lastAnalyticsAttemptAt && now - lastAnalyticsAttemptAt < 5000) {
        set({ isLoadingAnalytics: false });
        return;
      }
      set({ lastAnalyticsAttemptAt: now });

      const response = await brain.get_watch_history_analytics();
      if (!response.ok) {
        if (response.status === 404) {
          // Keep analytics as null and back off further attempts for a short period
          set({ analytics: null, isLoadingAnalytics: false });
          return;
        }
        throw new Error(`Failed to load watch history analytics (${response.status})`);
      }

      const data: GetWatchHistoryAnalyticsData = await response.json();
      set({
        analytics: data ?? null,
        isLoadingAnalytics: false,
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to load watch history analytics", error);
      set({ error: (error as Error).message, isLoadingAnalytics: false });
    }
  },

  refresh: async () => {
    // Refresh status first; only fetch analytics when data is expected to exist
    await get().loadStatus();
    await get().loadAnalytics();
  },

  uploadTakeout: async (file: File) => {
    set({ isUploading: true, uploadMessage: null, error: null });
    try {
      const response = await brain.upload_watch_history_takeout({ file });
      const data: UploadWatchHistoryTakeoutData = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to process watch history file");
      }

      set({ uploadMessage: data.message });
      await get().refresh();
    } catch (error) {
      console.error("Failed to upload watch history", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isUploading: false });
    }
  },

  deleteHistory: async () => {
    set({ error: null, uploadMessage: null });
    try {
      const response = await brain.delete_watch_history();
      const data: DeleteWatchHistoryData = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to delete watch history");
      }
      set({ analytics: null, status: null, uploadMessage: data.message, lastUpdatedAt: null });
    } catch (error) {
      console.error("Failed to delete watch history", error);
      set({ error: (error as Error).message });
    }
  },
}));

export default useWatchHistoryStore;
