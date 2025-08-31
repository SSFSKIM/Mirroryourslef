import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import brain from "brain";
import useDataStore from "../utils/dataStore";
import { firebaseAuth } from "app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, RefreshCw } from "lucide-react";

interface SyncStatus {
  message?: string;
  last_run?: string | null;
  last_synced?: string | null; // Different APIs use different field names
  success?: boolean | null;
  items_processed?: number | null;
  total_videos?: number | null;
  next_scheduled?: string | null;
  error?: string | null;
  is_syncing?: boolean;
}

export function YouTubeSyncButton() {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const { user } = useDataStore();

  const fetchSyncStatus = async () => {
    if (!user) return;
    
    try {
      // Try the new API first
      try {
        const response = await brain.get_sync_status();
        const status = await response.json();
        setSyncStatus({
          ...status,
          last_run: status.last_synced || null // Normalize field names
        });
        
        // If sync is in progress, update UI
        if (status.is_syncing) {
          setSyncing(true);
          // Show animated progress during sync
          setSyncProgress(prev => (prev < 90 ? prev + 10 : 90));
        } else {
          setSyncing(false);
          setSyncProgress(100); // Done
          
          // Reset progress after a delay
          setTimeout(() => setSyncProgress(0), 1000);
        }
      } catch (e) {
        // Fall back to legacy API
        const response = await brain.youtube_get_sync_status();
        const status = await response.json();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error("Error fetching sync status:", error);
      toast.error("Error checking sync status");
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Set up polling to refresh sync status every 5 seconds while syncing
    // More frequent updates for better user experience
    let interval: NodeJS.Timeout | null = null;
    
    if (syncing) {
      interval = setInterval(() => {
        fetchSyncStatus();
        // Increment progress for visual feedback
        setSyncProgress(prev => {
          // Cap at 90% until we get confirmation of completion
          return prev < 90 ? prev + 2 : 90;
        });
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, syncing]);

  const startSync = async () => {
    if (!user) {
      toast.error("Please sign in to sync your YouTube history");
      return;
    }
    
    try {
      setSyncing(true);
      setSyncProgress(10); // Initial progress to show something is happening
      
      toast.info("Requesting YouTube permissions...");
      
      // Request YouTube permissions with Google Auth
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
      
      // Sign in with popup to get user consent
      const result = await signInWithPopup(firebaseAuth, provider);
      
      // Extract the access token
      // @ts-ignore - We know credential has this property for GoogleAuthProvider
      const accessToken = (result.credential as any).accessToken;
      
      if (!accessToken) {
        throw new Error("Failed to obtain YouTube access token");
      }

      setSyncProgress(30); // Update progress after auth
      toast.info("Starting YouTube data synchronization...");
      
      // Start the sync process with the access token
      const response = await brain.sync_watch_history({
        access_token: accessToken
      });
      
      const data = await response.json();
      
      setSyncProgress(50); // Update progress after sync start
      
      toast.success("YouTube history sync started!");
      
      // Set a timeout to check status after 2 seconds
      setTimeout(() => {
        fetchSyncStatus();
        // Increment progress to show activity
        setSyncProgress(60);
      }, 2000);
    } catch (error) {
      console.error("Error syncing YouTube history:", error);
      toast.error("Failed to sync YouTube history: " + (error instanceof Error ? error.message : "Unknown error"));
      setSyncing(false);
      setSyncProgress(0); // Reset progress on error
    } finally {
      // Keep syncing true until we detect the sync is complete
      setTimeout(() => {
        fetchSyncStatus();
      }, 3000);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">YouTube History Sync</CardTitle>
        <CardDescription>
          Sync your watch history to see detailed analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Information */}
        {syncStatus?.last_run || syncStatus?.last_synced ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last synced:</span>
              <span className="font-medium">{formatDate(syncStatus?.last_run || syncStatus?.last_synced)}</span>
            </div>
            
            {syncStatus?.total_videos || syncStatus?.items_processed ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Videos processed:</span>
                <span className="font-medium">{syncStatus?.total_videos || syncStatus?.items_processed || 0}</span>
              </div>
            ) : null}
            
            {syncStatus?.next_scheduled && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next scheduled:</span>
                <span className="font-medium">{formatDate(syncStatus?.next_scheduled)}</span>
              </div>
            )}
          </div>
        ) : (
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No sync history</AlertTitle>
            <AlertDescription>
              Sync your YouTube watch history to see analytics and insights.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error message if present */}
        {syncStatus?.error && !syncing && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync failed</AlertTitle>
            <AlertDescription>
              {syncStatus.error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Success message */}
        {syncStatus?.success && !syncing && syncProgress === 0 && (
          <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <Check className="h-4 w-4" />
            <AlertTitle>Sync completed</AlertTitle>
            <AlertDescription>
              Successfully synced {syncStatus?.items_processed || syncStatus?.total_videos || 0} videos.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Progress indicator */}
        {syncProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sync progress</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
            {syncing && (
              <p className="text-xs text-muted-foreground animate-pulse">
                {syncProgress < 30 ? "Requesting access..." :
                 syncProgress < 60 ? "Fetching your watch history..." :
                 syncProgress < 90 ? "Processing videos..." : 
                 "Finalizing sync..."}
              </p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={startSync} 
          disabled={syncing}
          className="w-full"
          variant="default"
        >
          {syncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing YouTube History...
            </>
          ) : (
            "Sync YouTube History"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
