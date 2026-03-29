import React from "react";
import { AnalyticsPanel } from "components/AnalyticsPanel";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle } from "lucide-react";
import useWatchHistoryStore from "utils/watchHistoryStore";

const sanitizeDistribution = (distribution?: Record<string, number>) => {
  if (!distribution) {
    return [];
  }
  return Object.entries(distribution)
    .sort((a, b) => {
      const order = ["<5 min", "5-15 min", "15-30 min", "30-60 min", ">60 min"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([bucket, count]) => ({ bucket, count }));
};

export const SessionDurationChart: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { analytics, isLoadingAnalytics } = useWatchHistoryStore();

  const data = React.useMemo(() => sanitizeDistribution(analytics?.session_distribution), [analytics]);

  if (isLoadingAnalytics) {
    return (
      <AnalyticsPanel
        title="Session Duration"
        caption="How your viewing sessions distribute by length"
        className={`${className} animate-pulse`}
      >
        <div className="loading-state h-48 rounded bg-muted" />
      </AnalyticsPanel>
    );
  }

  if (!analytics || !data.length) {
    return (
      <AnalyticsPanel
        title="Session Duration"
        caption="How your viewing sessions distribute by length"
        className={className}
      >
        <div className="empty-state flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>We need recent watch history to chart how long your sessions last.</span>
        </div>
      </AnalyticsPanel>
    );
  }

  return (
    <AnalyticsPanel
      eyebrow="Session Analysis"
      title="Session Duration"
      caption="How your viewing sessions distribute by length"
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis allowDecimals={false} width={35} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip formatter={(value) => [`${value} sessions`, "Sessions"]} />
            <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#sessionGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
};

export default SessionDurationChart;
