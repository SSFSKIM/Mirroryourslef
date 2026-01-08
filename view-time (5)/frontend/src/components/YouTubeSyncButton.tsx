import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from 'utils/auth';
import useDataStore from 'utils/dataStore';
import { Loader2, Youtube, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { firebaseAuth } from 'app';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  getAdditionalUserInfo 
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
      let accessToken = sessionStorage.getItem('youtube_access_token');
      
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
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <Youtube className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-semibold">YouTube Liked Videos Analytics</h3>
            <p className="text-sm text-gray-500">
              {syncStatus.lastSync 
                ? `Last synced: ${formatLastSync(syncStatus.lastSync)}`
                : 'Not synced yet'}
            </p>
            {syncStatus.itemsProcessed && (
              <div className="space-y-1">
                <p className="text-sm text-green-600">
                  ✓ {syncStatus.itemsProcessed} liked videos synced
                </p>
                {syncStatus.analyticsGenerated && (
                  <p className="text-sm text-blue-600 flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics generated
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!needsAuth && (
            <div className="flex flex-col space-y-2">
              <label className="text-xs text-gray-500">Sample Size</label>
              <Select
                value={selectedSampleSize.toString()}
                onValueChange={(value) => {
                  setHasManualSelection(true);
                  setSelectedSampleSize(parseInt(value));
                }}
                disabled={isSyncing}
              >
                <SelectTrigger className="w-32">
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
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {needsAuth ? 'Authenticating...' : 'Syncing...'}
              </>
            ) : needsAuth ? (
              <>
                <Youtube className="mr-2 h-4 w-4" />
                Connect YouTube
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sync Liked Videos
              </>
            )}
          </Button>
        </div>
      </div>

      {syncStatus.error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{syncStatus.error}</p>
        </div>
      )}

      {needsAuth && !isSyncing && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            📌 Connect your YouTube account to analyze your liked videos.
            Click "Connect YouTube" to get started.
          </p>
        </div>
      )}
      
      {!needsAuth && !syncStatus.lastSync && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            📊 Choose your sample size and sync your liked videos to generate analytics insights including categories, keywords, and viewing patterns.
          </p>
        </div>
      )}
    </div>
  );
}
