


import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Users, Tag, RefreshCw, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import brain from "brain";
import useDataStore from "../utils/dataStore";
import useSyncStore from "../utils/syncStore";

interface LikedVideoData {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  categoryId: string;
  duration: number;
  likedAt: string;
  isShort: boolean;
  tags: string[];
}

interface AnalyticsSummary {
  totalVideos: number;
  uniqueChannels: number;
  shortsPercentage: number;
  avgDuration: number;
  topCategories: Array<{category: string, count: number}>;
  topChannels: Array<{channelTitle: string, count: number}>;
  topKeywords: Array<{keyword: string, count: number}>;
  recentVideos: LikedVideoData[];
  analyticsAvailable: boolean;
}

export function YouTubeDataPreview() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useDataStore();
  const { syncTrigger, analyticsReady, isSyncing } = useSyncStore();

  const fetchLikedVideosAnalytics = useCallback(async (showLoadingState = true) => {
    if (!user) {
      setError("Please sign in to view your analytics");
      setLoading(false);
      return;
    }
    
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);
      
      // Check sync status first
      const statusResponse = await brain.get_sync_status();
      const status = await statusResponse.json();
      
      console.log('Sync status:', status);
      
      // If we don't have any synced data yet
      if (!status.total_videos || status.total_videos === 0) {
        setError("No liked videos data found. Please sync your YouTube liked videos first.");
        setLoading(false);
        return;
      }
      
      // If analytics haven't been generated yet but sync is complete
      if (!status.analytics_available && !isSyncing) {
        setError("Analytics are being generated. Please wait a moment and refresh...");
        setLoading(false);
        
        // Automatically retry after a delay
        setTimeout(() => {
          fetchLikedVideosAnalytics(false);
        }, 3000);
        return;
      }
      
      // If analytics are available, fetch them
      if (status.analytics_available) {
        const analyticsResponse = await brain.get_analytics({ sample_size: status.sample_size || 100 });
        const analytics = await analyticsResponse.json();
        
        if (!analytics.success) {
          throw new Error('Failed to fetch analytics data');
        }
        
        // Transform the API response to our summary format
        const analyticsSummary: AnalyticsSummary = {
          totalVideos: status.total_videos,
          uniqueChannels: analytics.analytics?.channel_stats?.total_channels || 0,
          shortsPercentage: analytics.analytics?.shorts_analysis?.shorts_percentage || 0,
          avgDuration: analytics.analytics?.duration_analysis?.average_duration || 0,
          topCategories: analytics.analytics?.category_breakdown?.map((cat: any) => ({
            category: cat.category,
            count: cat.count
          })) || [],
          topChannels: analytics.analytics?.channel_stats?.top_channels?.map((ch: any) => ({
            channelTitle: ch.channel_name,
            count: ch.video_count
          })) || [],
          topKeywords: analytics.analytics?.keyword_analysis?.top_keywords?.map((kw: any) => ({
            keyword: kw.keyword,
            count: kw.frequency
          })) || [],
          recentVideos: [],
          analyticsAvailable: true
        };
        
        setSummary(analyticsSummary);
        setError(null);
      }
      
    } catch (err: any) {
      console.error("Error fetching liked videos analytics:", err);
      setError("Error loading analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, isSyncing]);

  // Initial load
  useEffect(() => {
    fetchLikedVideosAnalytics();
  }, [user]);

  // Refresh when sync completes (syncTrigger changes)
  useEffect(() => {
    if (syncTrigger > 0) {
      console.log('Sync completed, refreshing analytics...');
      // Add a small delay to allow backend to process
      setTimeout(() => {
        fetchLikedVideosAnalytics();
      }, 1000);
    }
  }, [syncTrigger, fetchLikedVideosAnalytics]);

  // Refresh when analytics become ready
  useEffect(() => {
    if (analyticsReady && !loading && !summary) {
      console.log('Analytics ready, fetching data...');
      fetchLikedVideosAnalytics();
    }
  }, [analyticsReady, loading, summary, fetchLikedVideosAnalytics]);

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchLikedVideosAnalytics();
  };

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Analytics...</CardTitle>
          <CardDescription>Fetching your YouTube liked videos data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button 
            onClick={handleManualRefresh} 
            variant="outline" 
            size="sm"
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>No analytics data available. Please sync your liked videos first.</span>
          <Button 
            onClick={handleManualRefresh} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <Button 
          onClick={handleManualRefresh} 
          variant="ghost" 
          size="sm"
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalVideos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Channels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueChannels}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shorts %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.shortsPercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(summary.avgDuration)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {summary.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.topCategories.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm">{cat.category}</span>
                  <span className="text-sm font-semibold">{cat.count} videos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Channels */}
      {summary.topChannels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.topChannels.slice(0, 5).map((channel, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm truncate">{channel.channelTitle}</span>
                  <span className="text-sm font-semibold">{channel.count} videos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
