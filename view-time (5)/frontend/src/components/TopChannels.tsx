import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import useDataStore from "utils/dataStore";

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

  const topChannels = analytics?.channelStats?.topChannels || [];
  const maxVideoCount = topChannels.length > 0 ? topChannels[0].videoCount : 1;

  // Derive active sample size (N)
  const nUsed = React.useMemo(() => {
    // Prefer explicit sample_size from API response
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    if (typeof topLevelN === "number") return topLevelN;
    // Fallback: sum of counts across all channels
    const total = Array.isArray(topChannels)
      ? topChannels.reduce((sum: number, ch: any) => sum + (ch?.videoCount || 0), 0)
      : 0;
    return total;
  }, [analytics, topChannels]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top {limit} Channels</CardTitle>
        <CardDescription>
          Ranked by number of liked videos • Based on last {nUsed} liked videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading analytics data.
          </div>
        ) : !topChannels || topChannels.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No channel data available yet. Sync your YouTube liked videos to see your top channels.
          </div>
        ) : (
          <div className="space-y-4">
            {topChannels.slice(0, limit).map((channel, index) => (
              <div key={channel.channelName} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://via.placeholder.com/40?text=${channel.channelName.charAt(0)}`} />
                  <AvatarFallback>{channel.channelName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {channel.channelName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {channel.videoCount} liked videos
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(channel.videoCount / maxVideoCount) * 100} 
                    className="w-20 h-2" 
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[2rem] text-right">
                    {channel.videoCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
