import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import useDataStore from "utils/dataStore";
import { LoadingSpinner } from "./LoadingSpinner";

interface TopChannelsProps {
  className?: string;
  limit?: number;
}

export function TopChannels({ className = "", limit = 10 }: TopChannelsProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  const channelStats = analytics?.channel_stats || analytics?.channelStats;
  const topChannelsData = channelStats?.top_channels || channelStats?.topChannels || [];
  const channelLikeCounts = channelStats?.channel_like_counts || channelStats?.channelLikeCounts || {};
  const channelInfoMap = channelStats?.channel_info_map || channelStats?.channelInfoMap || {};

  // Transform top_channels from list of IDs to list of objects with name and count
  const topChannels = React.useMemo(() => {
    if (!topChannelsData || !Array.isArray(topChannelsData)) return [];

    return topChannelsData
      .map(channelId => {
        const videoCount = channelLikeCounts[channelId] || 0;
        const channelInfo = channelInfoMap[channelId];
        return {
          channel_id: channelId,
          channel_name: channelInfo?.channel_title || 'Unknown Channel',
          video_count: videoCount
        };
      })
      .filter(channel => channel.video_count > 0);
  }, [topChannelsData, channelLikeCounts, channelInfoMap]);

  const maxVideoCount = topChannels.length > 0 ? topChannels[0].video_count : 1;

  // Derive active sample size (N)
  const nUsed = React.useMemo(() => {
    // Prefer explicit sample_size from API response
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    if (typeof topLevelN === "number") return topLevelN;
    // Fallback: sum of counts across all channels
    const total = Array.isArray(topChannels)
      ? topChannels.reduce((sum: number, ch: any) => sum + (ch?.video_count || ch?.videoCount || 0), 0)
      : 0;
    return total;
  }, [analytics, topChannels]);

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle>Top {limit} Channels</CardTitle>
        <CardDescription>
          Ranked by number of liked videos • Based on last {nUsed} liked videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <LoadingSpinner className="h-72" label="Loading top channels" />
        ) : analyticsError ? (
          <div className="py-8 text-center text-destructive">
            Error loading analytics data.
          </div>
        ) : !topChannels || topChannels.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No channel data available yet. Sync your YouTube liked videos to see your top channels.
          </div>
        ) : (
          <div className="space-y-4">
            {topChannels.slice(0, limit).map((channel, index) => {
              // Support both snake_case and camelCase
              const channelId = channel.channel_id || channel.channelId || '';
              const channelName = channel.channel_name || channel.channelName || 'Unknown';
              const videoCount = channel.video_count || channel.videoCount || 0;

              // Get channel info from map if available
              const channelInfo = channelInfoMap[channelId];
              const thumbnailUrl = channelInfo?.thumbnailUrl ||
                                  channelInfo?.thumbnail_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=ef4444&color=fff&size=40&bold=true`;

              return (
                <div key={channelName + index} className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thumbnailUrl} alt={channelName} />
                    <AvatarFallback>{channelName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {channelName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {videoCount} liked videos
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={(videoCount / maxVideoCount) * 100}
                    className="w-20 h-2"
                  />
                  <span className="min-w-[2rem] text-right text-xs text-muted-foreground">
                    {videoCount}
                  </span>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
