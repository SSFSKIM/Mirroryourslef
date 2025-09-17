

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from 'utils/auth';
import { Loader2, Youtube, CheckCircle, AlertCircle } from 'lucide-react';
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
  error?: string;
}

export default function YouTubeSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});
  const [needsAuth, setNeedsAuth] = useState(false);
  const { user } = useAuthStore();

  // Check if user has valid YouTube access token
  useEffect(() => {
    checkYouTubeAuth();
  }, [user]);

  const checkYouTubeAuth = async () => {
    if (!user) {
      setNeedsAuth(true);
      return;
    }

    try {
      // Check if we have a valid token
      const token = await user.getIdToken();
      if (!token) {
        setNeedsAuth(true);
      }
    } catch (error) {
      console.log('Need to authenticate with YouTube');
      setNeedsAuth(true);
    }
  };

  const authenticateWithYouTube = async () => {
    try {
      setIsSyncing(true);
      
      // Create Google provider with YouTube scope
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
      
      // Sign in with popup
      const result = await signInWithPopup(firebaseAuth, provider);
      
      // Get the OAuth access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token received from Google');
      }
      
      // Store the access token temporarily (you might want to store this more securely)
      sessionStorage.setItem('youtube_access_token', accessToken);
      
      console.log('YouTube authentication successful');
      setNeedsAuth(false);
      
      // Proceed with sync
      await syncYouTubeHistory(accessToken);
      
    } catch (error: any) {
      console.error('YouTube authentication error:', error);
      setSyncStatus({
        error: error.message || 'Failed to authenticate with YouTube'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const startSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus({});

      // First, check if we have a stored access token
      let accessToken = sessionStorage.getItem('youtube_access_token');
      
      // If no stored token, try to get it from current user
      if (!accessToken && user) {
        // For Firebase Auth, we need to re-authenticate to get YouTube token
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
        
        try {
          const result = await signInWithPopup(firebaseAuth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          accessToken = credential?.accessToken || null;
          
          if (accessToken) {
            sessionStorage.setItem('youtube_access_token', accessToken);
          }
        } catch (error) {
          console.error('Failed to get YouTube access token:', error);
          setNeedsAuth(true);
          throw new Error('Please authenticate with YouTube first');
        }
      }

      if (!accessToken) {
        setNeedsAuth(true);
        throw new Error('No YouTube access token available. Please authenticate first.');
      }

      await syncYouTubeHistory(accessToken);

    } catch (error: any) {
      console.error('Error syncing YouTube history:', error);
      setSyncStatus({
        error: error.message || 'Failed to sync YouTube history'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncYouTubeHistory = async (accessToken: string) => {
    try {
      // Call the YouTube sync API with the access token
      const response = await brain.sync_watch_history_endpoint({
        access_token: accessToken
      });

      const data = await response.json();
      
      setSyncStatus({
        lastSync: new Date().toISOString(),
        itemsProcessed: data.items_synced || 0,
      });

      console.log('Sync completed successfully:', data);
      
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
            <h3 className="font-semibold">YouTube Watch History</h3>
            <p className="text-sm text-gray-500">
              {syncStatus.lastSync 
                ? `Last synced: ${formatLastSync(syncStatus.lastSync)}`
                : 'Not synced yet'}
            </p>
            {syncStatus.itemsProcessed && (
              <p className="text-sm text-green-600">
                ✓ {syncStatus.itemsProcessed} items synced
              </p>
            )}
          </div>
        </div>
        
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
              Sync Now
            </>
          )}
        </Button>
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
            📌 You need to connect your YouTube account to sync watch history.
            Click "Connect YouTube" to get started.
          </p>
        </div>
      )}
    </div>
  );
}
