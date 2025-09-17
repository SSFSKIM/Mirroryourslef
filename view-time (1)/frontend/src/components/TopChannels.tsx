import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import useDataStore from "utils/dataStore";

// Helper function to format seconds into a more readable string
const formatWatchTime = (seconds: number) => {
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  const hours = seconds / 3600;
  return `${hours.toFixed(1)}h`;
};

interface TopChannelsProps {
  className?: string;
  limit?: number;
}

export function TopChannels({ className = "", limit = 10 }: TopChannelsProps) {
  const { topChannels, isTopChannelsLoading, topChannelsError, loadTopChannels } = useDataStore();

  React.useEffect(() => {
    if (!topChannels) {
      loadTopChannels(limit);
    }
  }, [topChannels, loadTopChannels, limit]);

  const maxWatchTime = topChannels && topChannels.length > 0 ? topChannels[0].totalWatchTime : 1;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top {limit} Channels</CardTitle>
        <CardDescription>Ranked by cumulative watch time</CardDescription>
      </CardHeader>
      <CardContent>
        {isTopChannelsLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : topChannelsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading top channels data.
          </div>
        ) : !topChannels || topChannels.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No channel data available yet. Sync your YouTube history to see your top channels.
          </div>
        ) : (
          <ul className="space-y-4">
            {topChannels.slice(0, limit).map((channel) => (
              <li key={channel.channelId} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={channel.thumbnailUrl} alt={channel.channelTitle} />
                  <AvatarFallback>{channel.channelTitle.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{channel.channelTitle}</p>
                  <Progress value={(channel.totalWatchTime / maxWatchTime) * 100} className="w-full h-2 mt-1" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatWatchTime(channel.totalWatchTime)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
