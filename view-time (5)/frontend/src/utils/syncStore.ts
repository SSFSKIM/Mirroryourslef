import { create } from 'zustand';

interface SyncStore {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  syncTrigger: number; // Increment this to trigger refresh in components
  analyticsReady: boolean;
  
  // Actions
  startSync: () => void;
  endSync: (success: boolean) => void;
  triggerRefresh: () => void;
  setAnalyticsReady: (ready: boolean) => void;
  resetSyncState: () => void;
}

const useSyncStore = create<SyncStore>((set) => ({
  lastSyncTime: null,
  isSyncing: false,
  syncTrigger: 0,
  analyticsReady: false,
  
  startSync: () => set({ 
    isSyncing: true, 
    analyticsReady: false 
  }),
  
  endSync: (success: boolean) => set((state) => ({ 
    isSyncing: false,
    lastSyncTime: success ? new Date() : state.lastSyncTime,
    syncTrigger: state.syncTrigger + 1, // Increment to trigger refresh
  })),
  
  triggerRefresh: () => set((state) => ({ 
    syncTrigger: state.syncTrigger + 1 
  })),
  
  setAnalyticsReady: (ready: boolean) => set({ 
    analyticsReady: ready 
  }),
  
  resetSyncState: () => set({
    lastSyncTime: null,
    isSyncing: false,
    syncTrigger: 0,
    analyticsReady: false,
  }),
}));

export default useSyncStore;
