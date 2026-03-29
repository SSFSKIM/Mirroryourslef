import { useState, useEffect } from 'react';
import { Button } from 'components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorialPanel } from 'components/EditorialPanel';
import { useAuthStore } from 'utils/auth';
import useDataStore from 'utils/dataStore';
import { Loader2, Youtube, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { firebaseAuth } from 'app';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import brain from 'brain';

interface SyncStatus {
  lastSync?: string;
  itemsProcessed?: number;
  analyticsGenerated?: boolean;
  sampleSize?: number;
  error?: string;
}

const SAMPLE_SIZE_OPTIONS = [
  { value: 50, label: "50 videos" },
  { value: 100, label: "100 videos" },
  { value: 150, label: "150 videos" },
  { value: 200, label: "200 videos" },
  { value: 250, label: "250 videos" }
];

export default function YouTubeSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});
  const [needsAuth, setNeedsAuth] = useState(false);
  const [selectedSampleSize, setSelectedSampleSize] = useState<number>(100);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const { user } = useAuthStore();
  const loadSyncStatusFromStore = useDataStore((state) => state.loadSyncStatus);
  const storeSyncStatus = useDataStore((state) => state.syncStatus);

  // Check current sync status on component mount
  useEffect(() => {
    checkSyncStatus();
  }, [user]);

  useEffect(() => {
    if (hasManualSelection) return;

    const storeSampleSize = storeSyncStatus?.sample_size
      ?? storeSyncStatus?.sampleSize
      ?? storeSyncStatus?.preferred_sample_size;

    if (storeSampleSize && storeSampleSize !== selectedSampleSize) {
      if (syncStatus.sampleSize === storeSampleSize) {
        setSelectedSampleSize(storeSampleSize);
      }
    }
  }, [hasManualSelection, selectedSampleSize, storeSyncStatus, syncStatus.sampleSize]);

  const checkSyncStatus = async () => {
    if (!user) {
      setNeedsAuth(true);
      return;
    }

    try {
      // Get current sync status from the API
      const response = await brain.get_sync_status();
      const status = await response.json();
      
      setSyncStatus({
        lastSync: status.last_synced,
        itemsProcessed: status.total_videos,
        analyticsGenerated: status.analytics_available,
        sampleSize: status.sample_size || 100
      });
      
      setSelectedSampleSize(status.sample_size || 100);
      setHasManualSelection(false);
      setNeedsAuth(false);
      
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.log('Need to authenticate with YouTube:', error);
      }
      setNeedsAuth(true);
    }
  };

  const authenticateWithYouTube = async () => {
    try {
      setIsSyncing(true);
      
      // Clear any existing tokens first
      sessionStorage.removeItem('youtube_access_token');
      
      // Create Google provider with YouTube scope
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
      
      // Force account selection to ensure fresh consent
      provider.setCustomParameters({
        'prompt': 'consent select_account'
      });
      
      // Sign in with popup
      const result = await signInWithPopup(firebaseAuth, provider);
      
      // Get the OAuth access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token received from Google. Please try again and ensure you grant YouTube permissions.');
      }
      
      // Test the access token by making a simple API call
      try {
        const testResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!testResponse.ok) {
          throw new Error(`YouTube API test failed: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        if (!testData.items || testData.items.length === 0) {
          throw new Error('Unable to access your YouTube channel. Please ensure you have a YouTube account.');
        }
      } catch (testError) {
        console.error('YouTube API test failed:', testError);
        throw new Error('Failed to verify YouTube access. Please try again.');
      }
      
      // Store the access token temporarily
      sessionStorage.setItem('youtube_access_token', accessToken);

      if (import.meta.env.DEV) {
        console.log('YouTube authentication successful');
      }
      setNeedsAuth(false);
      
      // Proceed with sync
      await syncYouTubeLikedVideos(accessToken);
      
    } catch (error: any) {
      console.error('YouTube authentication error:', error);
      setSyncStatus({
        error: error.message || 'Failed to authenticate with YouTube'
      });
      setNeedsAuth(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const startSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus({});

      // First, check if we have a stored and potentially valid access token
      const accessToken = sessionStorage.getItem('youtube_access_token');
      
      // If no stored token or if we want to ensure fresh token, authenticate
      if (!accessToken) {
        if (import.meta.env.DEV) {
          console.log('No access token found, initiating authentication...');
        }
        await authenticateWithYouTube();
        return; // authenticateWithYouTube will call syncYouTubeLikedVideos
      }
      
      // Test the existing token before using it
      try {
        const testResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!testResponse.ok) {
          if (import.meta.env.DEV) {
            console.log('Stored token is invalid, re-authenticating...');
          }
          sessionStorage.removeItem('youtube_access_token');
          await authenticateWithYouTube();
          return; // authenticateWithYouTube will call syncYouTubeLikedVideos
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Token validation failed, re-authenticating...', error);
        }
        sessionStorage.removeItem('youtube_access_token');
        await authenticateWithYouTube();
        return; // authenticateWithYouTube will call syncYouTubeLikedVideos
      }

      // If we reach here, the token is valid, proceed with sync
      await syncYouTubeLikedVideos(accessToken);

    } catch (error: any) {
      console.error('Error syncing YouTube liked videos:', error);
      setSyncStatus({
        error: error.message || 'Failed to sync YouTube liked videos'
      });
      setNeedsAuth(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncYouTubeLikedVideos = async (accessToken: string) => {
    try {
      // Call the new liked videos sync API with the access token and sample size
      const response = await brain.sync_liked_videos({
        access_token: accessToken,
        sample_size: selectedSampleSize
      });

      const data = await response.json();
      
      setSyncStatus({
        lastSync: new Date().toISOString(),
        itemsProcessed: data.videos_synced || 0,
        analyticsGenerated: data.analytics_generated || false,
        sampleSize: selectedSampleSize,
      });

      if (import.meta.env.DEV) {
        console.log('Liked videos sync completed successfully:', data);
      }

      // Refresh sync status to get updated analytics info
      setTimeout(() => {
        checkSyncStatus();
      }, 1000);

      try {
        await loadSyncStatusFromStore();
      } catch (storeError) {
        console.error('Failed to refresh shared sync status:', storeError);
      }
      
    } catch (error: any) {
      console.error('Sync error:', error);
      throw error;
    }
  };

  const handleSyncClick = () => {
    if (needsAuth) {
      authenticateWithYouTube();
    } else {
      startSync();
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <section className="space-y-4" aria-labelledby="liked-videos-sync-title">
      <EditorialPanel tone="secondary">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 rounded-md bg-red-500/10 p-2">
              <Youtube aria-hidden="true" className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <h3 id="liked-videos-sync-title" className="font-display text-lg font-semibold tracking-tight">
                YouTube Liked Videos Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
              {syncStatus.lastSync
                ? `Last synced: ${formatLastSync(syncStatus.lastSync)}`
                : 'Not synced yet'}
              </p>
              {syncStatus.itemsProcessed ? (
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-1 text-sm text-signal">
                    <CheckCircle aria-hidden="true" className="h-3.5 w-3.5" />
                    {syncStatus.itemsProcessed} liked videos synced
                  </p>
                  {syncStatus.analyticsGenerated && (
                    <p className="flex items-center gap-1 text-sm text-primary">
                      <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />
                      Analytics generated
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
            {!needsAuth && (
              <div className="flex w-full flex-col gap-2 sm:w-auto">
                <label htmlFor="liked-video-sample-size" className="section-eyebrow text-xs">
                  Sample Size
                </label>
                <Select
                  value={selectedSampleSize.toString()}
                  onValueChange={(value) => {
                    setHasManualSelection(true);
                    setSelectedSampleSize(parseInt(value));
                  }}
                  disabled={isSyncing}
                >
                  <SelectTrigger id="liked-video-sample-size" className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleSyncClick}
              disabled={isSyncing}
              variant={needsAuth ? "outline" : "default"}
              className="w-full sm:w-auto"
            >
              {isSyncing ? (
                <>
                  <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                  {needsAuth ? 'Authenticating...' : 'Syncing...'}
                </>
              ) : needsAuth ? (
                <>
                  <Youtube aria-hidden="true" className="mr-2 h-4 w-4" />
                  Connect YouTube
                </>
              ) : (
                <>
                  <CheckCircle aria-hidden="true" className="mr-2 h-4 w-4" />
                  Sync Liked Videos
                </>
              )}
            </Button>
          </div>
        </div>
      </EditorialPanel>

      {syncStatus.error && (
        <div className="error-state rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{syncStatus.error}</p>
          </div>
        </div>
      )}

      {needsAuth && !isSyncing && (
        <div className="editorial-note rounded-lg border border-border/70 bg-paper p-4">
          <div className="flex items-start gap-2">
            <Youtube aria-hidden="true" className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your YouTube account to analyze your liked videos. Select an account and grant YouTube access to get started.
            </p>
          </div>
        </div>
      )}

      {!needsAuth && !syncStatus.lastSync && (
        <div className="editorial-note rounded-lg border border-border/70 bg-paper p-4">
          <div className="flex items-start gap-2">
            <BarChart3 aria-hidden="true" className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Choose your sample size and sync your liked videos to generate analytics for categories, keywords, channels, and viewing patterns.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
