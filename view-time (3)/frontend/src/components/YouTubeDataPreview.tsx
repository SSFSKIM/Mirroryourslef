
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Users, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import brain from "brain";
import useDataStore from "../utils/dataStore";

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

  const fetchLikedVideosAnalytics = async () => {
    if (!user) {
      setError("Please sign in to view your analytics");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Check sync status first
      const statusResponse = await brain.get_sync_status();
      const status = await statusResponse.json();
      
      // If we don't have any synced data yet
      if (!status.total_videos || status.total_videos === 0) {
        setError("No liked videos data found. Please sync your YouTube liked videos first.");
        setLoading(false);
        return;
      }
      
      // If analytics haven't been generated yet
      if (!status.analytics_available) {
        setError("Analytics are being generated. Please try again in a few moments.");
        setLoading(false);
        return;
      }
      
      // Fetch the analytics data
      const analyticsResponse = await brain.get_analytics();
      const analytics = await analyticsResponse.json();
      
      // Transform the API response to our summary format
      const analyticsSummary: AnalyticsSummary = {
        totalVideos: status.total_videos,
        uniqueChannels: analytics.channel_stats?.total_channels || 0,
        shortsPercentage: analytics.shorts_analysis?.shorts_percentage || 0,
        avgDuration: analytics.duration_analysis?.average_duration || 0,
        topCategories: analytics.category_breakdown?.map((cat: any) => ({
          category: cat.category,
          count: cat.count
        })) || [],
        topChannels: analytics.channel_stats?.top_channels?.map((ch: any) => ({
          channelTitle: ch.channel_name,
          count: ch.video_count
        })) || [],
        topKeywords: analytics.keyword_analysis?.top_keywords?.map((kw: any) => ({
          keyword: kw.keyword,
          count: kw.frequency
        })) || [],
        recentVideos: [], // We could add this from a separate endpoint if needed
        analyticsAvailable: true
      };
      
      setSummary(analyticsSummary);
      
    } catch (err: any) {
      console.error("Error fetching liked videos analytics:", err);
      setError("Error loading analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideosAnalytics();
  }, [user]);

  // Helper function to format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
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
          <CardTitle className="text-lg">YouTube Liked Videos Analytics</CardTitle>
          <CardDescription>
            Loading your analytics data...
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
          <Skeleton className="h-40 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">YouTube Liked Videos Analytics</CardTitle>
          <CardDescription>
            Unable to display your analytics data
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
        <CardTitle className="text-lg">YouTube Liked Videos Analytics</CardTitle>
        <CardDescription>
          Insights from your liked videos
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
            <p className="text-sm text-muted-foreground">Avg Duration</p>
            <p className="text-2xl font-bold">{formatDuration(summary.avgDuration)}</p>
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
        
        {/* Top categories */}
        {summary.topCategories && summary.topCategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Categories
            </h3>
            <div className="space-y-1">
              {summary.topCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm truncate flex-1">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-primary h-2 rounded" 
                      style={{ 
                        width: `${(category.count / summary.topCategories[0].count) * 100}px`,
                        maxWidth: '100px'
                      }}
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Top channels */}
        {summary.topChannels && summary.topChannels.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Top Channels
            </h3>
            <div className="space-y-1">
              {summary.topChannels.slice(0, 5).map((channel, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm truncate flex-1">{channel.channelTitle}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-secondary h-2 rounded" 
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
        )}
        
        {/* Top keywords */}
        {summary.topKeywords && summary.topKeywords.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Popular Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.topKeywords.slice(0, 10).map((keyword, index) => (
                <div key={index} className="bg-muted px-2 py-1 rounded-md text-sm flex items-center gap-1">
                  <span>{keyword.keyword}</span>
                  <span className="text-xs text-muted-foreground">({keyword.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          <p>Analytics are generated from your synced liked videos</p>
        </div>
      </CardContent>
    </Card>
  );
}
