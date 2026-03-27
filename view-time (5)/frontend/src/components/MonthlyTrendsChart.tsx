import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import useDataStore from "utils/dataStore";
import { LoadingSpinner } from "./LoadingSpinner";
import { chartTooltipStyle } from "./ChartTooltip";

interface MonthlyTrendsChartProps {
  className?: string;
}

export function MonthlyTrendsChart({ className = "" }: MonthlyTrendsChartProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  const contentTrends = (analytics as any)?.contentTrends || (analytics as any)?.content_trends;

  // Format month label from "YYYY-MM" to "Mon 'YY"
  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const yearShort = year.substring(2);
      return `${monthName} '${yearShort}`;
    } catch {
      return monthStr;
    }
  };

  const monthlyData = React.useMemo(() => {
    const likesByMonth = contentTrends?.likes_by_month || contentTrends?.likesByMonth || {};

    // Convert to array and sort by date
    const data = Object.entries(likesByMonth).map(([month, count]) => ({
      month,
      monthLabel: formatMonthLabel(month),
      count: count as number
    }));

    // Sort by month (YYYY-MM format)
    data.sort((a, b) => a.month.localeCompare(b.month));

    return data;
  }, [contentTrends]);

  const nUsed = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size ?? 0;
  const totalLikes = monthlyData.reduce((sum, item) => sum + item.count, 0);
  const avgLikesPerMonth = monthlyData.length > 0 ? Math.round(totalLikes / monthlyData.length) : 0;

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle>Likes Over Time</CardTitle>
        <CardDescription>
          Monthly trend of liked videos • Based on last {nUsed} liked videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <LoadingSpinner className="h-72" label="Loading monthly trends" />
        ) : analyticsError ? (
          <div className="py-8 text-center text-destructive">
            Error loading analytics data
          </div>
        ) : !contentTrends || monthlyData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No monthly trend data available yet. Sync your YouTube liked videos to see patterns.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Period</div>
                <div className="text-2xl font-bold">{monthlyData.length} months</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Avg per Month</div>
                <div className="text-2xl font-bold">{avgLikesPerMonth} likes</div>
              </div>
            </div>

            {/* Area Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-accent))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-muted))" />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 12 }}
                  angle={monthlyData.length > 12 ? -45 : 0}
                  textAnchor={monthlyData.length > 12 ? "end" : "middle"}
                  height={monthlyData.length > 12 ? 60 : 30}
                />
                <YAxis />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelFormatter={(value) => `Month: ${value}`}
                  formatter={(value: number) => [value, 'Likes']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-accent))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Peak Month */}
            {monthlyData.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Peak month:{" "}
                <span className="font-semibold text-foreground">
                  {monthlyData.reduce((max, item) => item.count > max.count ? item : max).monthLabel}
                  {" "}
                  ({monthlyData.reduce((max, item) => item.count > max.count ? item : max).count} likes)
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
