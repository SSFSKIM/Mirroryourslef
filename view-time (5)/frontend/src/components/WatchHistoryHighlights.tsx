import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Timer, SplitSquareHorizontal, Sparkles } from "lucide-react";

import useWatchHistoryStore from "utils/watchHistoryStore";

const formatMinutes = (value: number): string => {
  if (value < 60) {
    return `${value.toFixed(1)} min`;
  }
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return `${hours}h ${minutes}m`;
};

const percentage = (value: number): string => `${(value * 100).toFixed(1)}%`;

interface WatchHistoryHighlightsProps {
  className?: string;
}

export const WatchHistoryHighlights: React.FC<WatchHistoryHighlightsProps> = ({ className = "" }) => {
  const { analytics, isLoadingAnalytics } = useWatchHistoryStore();

  if (isLoadingAnalytics) {
    return (
      <div className={`grid grid-cols-1 gap-4 lg:grid-cols-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Upload your Google Takeout watch history to reveal viewing patterns and personalised nudges.
      </div>
    );
  }

  const dailyAverage = analytics.daily_average_minutes ?? 0;
  const weeklyMinutes = analytics.weekly_minutes ?? 0;
  const shortsShare = analytics.shorts_share ?? 0;
  const algorithmicShare = analytics.algorithmic_view_share ?? 0;
  const avgSessionDuration = analytics.average_session_duration_minutes ?? 0;
  const avgVideosPerSession = analytics.average_videos_per_session ?? 0;
  const avgShortsStreak = analytics.average_shorts_streak_minutes ?? 0;

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Daily Average Viewing</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatMinutes(dailyAverage)}</p>
          <p className="text-xs text-muted-foreground">Based on your imported history</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Weekly Shorts Time</CardTitle>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatMinutes(weeklyMinutes * shortsShare)}</p>
          <p className="text-xs text-muted-foreground">Reflects the share of Shorts consumption</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Algorithmic Influence</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{percentage(algorithmicShare)}</p>
          <p className="text-xs text-muted-foreground">Viewing driven by recommendations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Session Rhythm</CardTitle>
          <SplitSquareHorizontal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="font-semibold">{formatMinutes(avgSessionDuration)}</span> per session</p>
          <p><span className="font-semibold">{avgVideosPerSession.toFixed(1)}</span> videos/session</p>
          <p><span className="font-semibold">{formatMinutes(avgShortsStreak)}</span> shorts streak</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WatchHistoryHighlights;
