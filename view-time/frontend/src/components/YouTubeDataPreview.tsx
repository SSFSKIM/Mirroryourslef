import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import brain from "brain";
import useDataStore from "../utils/dataStore";

interface VideoData {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  watchCount: number;
  videoLength: number;
  totalWatchTime: number;
  thumbnailUrl: string;
  lastWatched: string;
  isShort: boolean;
}

interface WatchHistorySummary {
  totalVideos: number;
  totalWatchTime: number;
  uniqueChannels: number;
  shortsPercentage: number;
  topChannels: Array<{channelTitle: string, count: number}>;
  recentVideos: VideoData[];
}

export function YouTubeDataPreview() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<WatchHistorySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useDataStore();

  const fetchWatchHistory = async () => {
    if (!user) {
      setError("Please sign in to view your data");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Attempt to fetch the user's watch history data
      const response = await brain.get_sync_status();
      const status = await response.json();
      
      // If we don't have any synced data yet
      if (!status.total_videos || status.total_videos === 0) {
        setError("No watch history data found. Please sync your YouTube history first.");
        setLoading(false);
        return;
      }
      
      // Use the watch history endpoint to get the actual data
      // For now, we'll create a sample summary based on the sync status
      // In a real implementation, we'd have an endpoint to fetch the processed data
      try {
        // Sample data for demonstration - in a full implementation, this would come from the API
        const sampleSummary: WatchHistorySummary = {
          totalVideos: status.total_videos || 0,
          totalWatchTime: Math.floor(Math.random() * 50000), // minutes
          uniqueChannels: Math.floor(Math.random() * 50) + 5,
          shortsPercentage: Math.random() * 0.4, // 0-40%
          topChannels: [
            { channelTitle: "Sample Channel 1", count: 42 },
            { channelTitle: "Sample Channel 2", count: 38 },
            { channelTitle: "Sample Channel 3", count: 25 },
          ],
          recentVideos: [
            {
              id: "sample1",
              title: "Sample Video 1",
              channelTitle: "Sample Channel 1",
              channelId: "UC123",
              watchCount: 3,
              videoLength: 600, // 10 minutes
              totalWatchTime: 1800, // 30 minutes
              thumbnailUrl: "https://i.ytimg.com/vi/sample1/default.jpg",
              lastWatched: new Date().toISOString(),
              isShort: false
            },
            {
              id: "sample2",
              title: "Sample Short",
              channelTitle: "Sample Channel 2",
              channelId: "UC456",
              watchCount: 5,
              videoLength: 30, // 30 seconds
              totalWatchTime: 150, // 2.5 minutes
              thumbnailUrl: "https://i.ytimg.com/vi/sample2/default.jpg",
              lastWatched: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              isShort: true
            },
          ]
        };
        
        setSummary(sampleSummary);
      } catch (err) {
        console.error("Error processing watch history data:", err);
        setError("Error processing watch history data");
      }
    } catch (err) {
      console.error("Error fetching watch history data:", err);
      setError("Error fetching watch history data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchHistory();
  }, [user]);

  // Helper function to format time in hours and minutes
  const formatWatchTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">YouTube Watch History Summary</CardTitle>
          <CardDescription>
            Loading your watch history data...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-md" />
          <Skeleton className="h-40 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">YouTube Watch History Summary</CardTitle>
          <CardDescription>
            Unable to display your watch history data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">YouTube Watch History Summary</CardTitle>
        <CardDescription>
          Overview of your watching habits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics in a grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold">{summary.totalVideos}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Watch Time</p>
            <p className="text-2xl font-bold">{formatWatchTime(summary.totalWatchTime)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Channels</p>
            <p className="text-2xl font-bold">{summary.uniqueChannels}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Shorts %</p>
            <p className="text-2xl font-bold">{Math.round(summary.shortsPercentage * 100)}%</p>
          </div>
        </div>
        
        {/* Top channels */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Top Channels</h3>
          <div className="space-y-1">
            {summary.topChannels.map((channel, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm truncate flex-1">{channel.channelTitle}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="bg-primary h-2 rounded" 
                    style={{ 
                      width: `${(channel.count / summary.topChannels[0].count) * 100}px`,
                      maxWidth: '100px'
                    }}
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">{channel.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent videos */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Videos</h3>
          <div className="space-y-2">
            {summary.recentVideos.map((video) => (
              <div key={video.id} className="flex gap-3 border rounded-md p-2">
                <div className="relative min-w-16 h-9 bg-muted rounded">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No thumbnail</span>
                    </div>
                  )}
                  {video.isShort && (
                    <div className="absolute bottom-0 right-0 bg-red-500 text-white text-xs px-1 rounded-sm">
                      Short
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground truncate">{video.channelTitle}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(video.lastWatched)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          <p>Data is updated when you sync your YouTube history</p>
        </div>
      </CardContent>
    </Card>
  );
}
