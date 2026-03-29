import React from "react";
import { Repeat, Clock, Calendar } from "lucide-react";
import { AnalyticsPanel } from "components/AnalyticsPanel";
import { Badge } from "@/components/ui/badge";
import useWatchHistoryStore from "utils/watchHistoryStore";

interface RepeatWatchListProps {
  className?: string;
}

export const RepeatWatchList: React.FC<RepeatWatchListProps> = ({ className = "" }) => {
  const { analytics } = useWatchHistoryStore();

  const repeatWatches = React.useMemo(() => {
    if (!analytics?.repeat_views) {
      return [];
    }

    return (analytics.repeat_views as any[])
      .map((item) => ({
        title: item.title || "Unknown Video",
        channel: item.channel_title || "Unknown Channel",
        timesWatched: item.watch_count || 0,
        lastWatched: item.last_watched_at || item.last_watched || new Date().toISOString(),
        videoId: item.video_id || `${item.title}-${item.channel_title}`,
      }))
      .filter((item) => item.timesWatched > 1)
      .sort((a, b) => b.timesWatched - a.timesWatched)
      .slice(0, 10);
  }, [analytics]);

  if (!analytics) {
    return null;
  }

  return (
    <AnalyticsPanel
      eyebrow="Revisited"
      title="Repeat Watches"
      caption="Videos you've returned to multiple times \u2014 your personal favorites and learning materials"
      className={className}
    >
      {repeatWatches.length === 0 ? (
        <div className="empty-state text-center py-8">
          <Repeat className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            We did not detect any repeat viewing yet. Upload more history or refresh after your next watch streak.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {repeatWatches.map((watch, index) => (
            <div
              key={`${watch.videoId}-${index}`}
              className="flex items-start justify-between rounded-lg border border-border-rule bg-paper px-4 py-3 transition-colors hover:bg-fog"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="font-data text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 text-foreground">
                    {watch.title}
                  </h4>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {watch.channel}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(watch.lastWatched).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="ml-3 shrink-0 rounded-sm text-xs font-data">
                <Clock className="h-3 w-3 mr-1" />
                {watch.timesWatched}&times;
              </Badge>
            </div>
          ))}
        </div>
      )}
    </AnalyticsPanel>
  );
};

export default RepeatWatchList;
