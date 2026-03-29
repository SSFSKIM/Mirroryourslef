import React from "react";
import { AnalyticsPanel } from "components/AnalyticsPanel";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useWatchHistoryStore from "utils/watchHistoryStore";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
];

export const RecommendationBreakdown: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { analytics, isLoadingAnalytics } = useWatchHistoryStore();

  const data = React.useMemo(() => {
    if (!analytics?.recommendation_breakdown) {
      return [];
    }

    const total = Object.values(analytics.recommendation_breakdown).reduce(
      (acc: number, value: number) => acc + value,
      0,
    );

    return Object.entries(analytics.recommendation_breakdown)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total ? Number(((value / total) * 100).toFixed(1)) : 0,
      }))
      .slice(0, 10);
  }, [analytics?.recommendation_breakdown]);

  if (isLoadingAnalytics) {
    return (
      <AnalyticsPanel
        title="Recommendation Sources"
        caption="What drives your viewing \u2014 algorithm vs intentional"
        className={`${className} animate-pulse`}
      >
        <div className="loading-state h-48 rounded bg-muted" />
      </AnalyticsPanel>
    );
  }

  if (!analytics || !data.length) {
    return (
      <AnalyticsPanel
        title="Recommendation Sources"
        caption="What drives your viewing \u2014 algorithm vs intentional"
        className={className}
      >
        <div className="empty-state flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Upload your watch history to see how each surface influences your viewing.</span>
        </div>
      </AnalyticsPanel>
    );
  }

  return (
    <AnalyticsPanel
      eyebrow="Viewing Sources"
      title="Recommendation Sources"
      caption="What drives your viewing \u2014 algorithm vs intentional"
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any, _name, props) => {
              const payload = props?.payload as { percentage: number; value: number } | undefined;
              if (!payload) {
                return [value, "Views"];
              }
              return [`${payload.value} views (${payload.percentage}%)`, "Views"];
            }} />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsPanel>
  );
};

export default RecommendationBreakdown;
