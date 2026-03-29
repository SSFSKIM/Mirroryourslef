import React from "react";
import { Flame, Timer, SplitSquareHorizontal, Sparkles } from "lucide-react";
import { StatCard } from "./StatCard";
import useWatchHistoryStore from "utils/watchHistoryStore";

const formatMinutes = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0m";
  }

  if (value < 60) {
    return `${value.toFixed(1)}m`;
  }

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const formatHours = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0h";
  }
  return `${(value / 60).toFixed(1)}h`;
};

const percentage = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0%";
  }
  return `${(value * 100).toFixed(1)}%`;
};

interface WatchHistoryHighlightsProps {
  className?: string;
}

export const WatchHistoryHighlights: React.FC<WatchHistoryHighlightsProps> = ({ className = "" }) => {
  const { analytics, isLoadingAnalytics } = useWatchHistoryStore();

  if (isLoadingAnalytics) {
    return (
      <div className={`loading-state grid grid-cols-1 gap-4 lg:grid-cols-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-paper p-6">
            <div className="mb-4 h-3 w-24 rounded bg-muted" />
            <div className="mb-2 h-10 w-20 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="empty-state rounded-lg border border-dashed border-border-rule p-6 text-center">
        <p className="text-sm text-ink-soft">
          Upload your Google Takeout watch history to reveal viewing patterns and personalised nudges.
        </p>
      </div>
    );
  }

  const dailyAverage = analytics.daily_average_minutes ?? 0;
  const weeklyMinutes = analytics.weekly_minutes ?? 0;
  const shortsMinutes = analytics.shorts_total_minutes ?? weeklyMinutes * (analytics.shorts_share ?? 0);
  const avgSessionDuration = analytics.average_session_duration_minutes ?? 0;
  const avgVideosPerSession = analytics.average_videos_per_session ?? 0;
  const algorithmicShare = analytics.algorithmic_view_share ?? 0;
  const algorithmicMinutes = analytics.algorithmic_minutes ?? weeklyMinutes * algorithmicShare;
  const intentionalMinutes = analytics.intentional_minutes ?? weeklyMinutes * (analytics.intentional_view_share ?? 0);

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-4 ${className}`}>
      <StatCard
        label="Daily Average"
        value={formatMinutes(dailyAverage)}
        subtitle="Based on your imported history"
        icon={Timer}
      />

      <StatCard
        label="Weekly Watch Time"
        value={formatHours(weeklyMinutes)}
        subtitle={`${formatHours(shortsMinutes)} of that is Shorts \u2014 ${percentage(shortsMinutes / (weeklyMinutes || 1))}`}
        icon={Sparkles}
      />

      <StatCard
        label="Algorithmic Influence"
        value={percentage(algorithmicShare)}
        subtitle={`${formatMinutes(algorithmicMinutes)} vs ${formatMinutes(intentionalMinutes)} intentional`}
        icon={Flame}
      />

      <StatCard
        label="Session Rhythm"
        value={formatMinutes(avgSessionDuration)}
        subtitle={`${avgVideosPerSession.toFixed(1)} videos per session on average`}
        icon={SplitSquareHorizontal}
      />
    </div>
  );
};

export default WatchHistoryHighlights;
