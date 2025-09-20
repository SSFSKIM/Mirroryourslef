import { create } from "zustand";
import brain from "brain";
import type {
  DeleteWatchHistoryData,
  GetWatchHistoryAnalyticsData,
  GetWatchHistoryStatusData,
  WatchHistoryStatus,
  WatchHistoryUploadResponse,
} from "types";

type WatchHistoryAnalytics = Record<string, any> | null;

type WatchHistoryState = {
  status: WatchHistoryStatus | null;
  analytics: WatchHistoryAnalytics;
  isLoadingStatus: boolean;
  isLoadingAnalytics: boolean;
  isUploading: boolean;
  error: string | null;
  uploadMessage: string | null;
  loadStatus: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
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

  loadStatus: async () => {
    set({ isLoadingStatus: true, error: null });
    try {
      const response = await brain.get_watch_history_status();
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
      const response = await brain.get_watch_history_analytics();
      const data: GetWatchHistoryAnalyticsData = await response.json();
      set({ analytics: data.analytics ?? null, isLoadingAnalytics: false });
    } catch (error) {
      console.error("Failed to load watch history analytics", error);
      set({ error: (error as Error).message, isLoadingAnalytics: false });
    }
  },

  uploadTakeout: async (file: File) => {
    set({ isUploading: true, uploadMessage: null, error: null });
    try {
      const response = await brain.upload_watch_history_takeout({ file });
      const data: WatchHistoryUploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to process watch history file");
      }

      set({ analytics: data.analytics ?? null, uploadMessage: data.message });

      await Promise.allSettled([get().loadStatus(), get().loadAnalytics()]);
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
      set({ analytics: null, status: null, uploadMessage: data.message });
    } catch (error) {
      console.error("Failed to delete watch history", error);
      set({ error: (error as Error).message });
    }
  },
}));

export default useWatchHistoryStore;
