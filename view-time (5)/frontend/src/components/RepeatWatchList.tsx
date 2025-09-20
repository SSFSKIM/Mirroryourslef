import React from "react";
import { Repeat, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useWatchHistoryStore from "utils/watchHistoryStore";

interface RepeatWatch {
  title: string;
  channel: string;
  timesWatched: number;
  lastWatched: string;
}

interface RepeatWatchListProps {
  className?: string;
}

export const RepeatWatchList: React.FC<RepeatWatchListProps> = ({ className = "" }) => {
  const { analytics } = useWatchHistoryStore();

  const repeatWatches: RepeatWatch[] = React.useMemo(() => {
    if (!analytics?.repeat_views) {
      return [];
    }

    // Convert analytics.repeat_views to RepeatWatch format
    return analytics.repeat_views.map((item: any) => ({
      title: item.title || "Unknown Video",
      channel: item.channel || "Unknown Channel",
      timesWatched: item.times_watched || 0,
      lastWatched: item.last_watched || new Date().toISOString(),
    })).slice(0, 10); // Show top 10
  }, [analytics]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Repeat Watches
        </CardTitle>
        <CardDescription>
          Videos you've returned to multiple times—your personal favorites and learning materials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {repeatWatches.length === 0 ? (
          <div className="text-center py-8">
            <Repeat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Upload your watch history to discover your most rewatched content.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {repeatWatches.map((watch, index) => (
              <div
                key={`${watch.title}-${index}`}
                className="flex items-start justify-between p-3 rounded-lg border bg-muted/20"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                    {watch.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {watch.channel}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(watch.lastWatched).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {watch.timesWatched}x
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepeatWatchList;
