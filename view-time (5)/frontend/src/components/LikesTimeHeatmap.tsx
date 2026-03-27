import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useDataStore from "utils/dataStore";
import { LoadingSpinner } from "./LoadingSpinner";
import { chartTooltipStyle } from "./ChartTooltip";

interface LikesTimeHeatmapProps {
  className?: string;
}

export function LikesTimeHeatmap({ className = "" }: LikesTimeHeatmapProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  const contentTrends = (analytics as any)?.contentTrends || (analytics as any)?.content_trends;

  // Process day of week data
  const dayOfWeekData = React.useMemo(() => {
    const likesByDay = contentTrends?.likes_by_day_of_week || contentTrends?.likesByDayOfWeek || {};
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayOrder.map(day => ({
      day: day.substring(0, 3), // Mon, Tue, etc.
      count: likesByDay[day] || 0
    }));
  }, [contentTrends]);

  // Process hourly data
  const hourlyData = React.useMemo(() => {
    const likesByHour = contentTrends?.likes_by_hour || contentTrends?.likesByHour || {};

    return Array.from({ length: 24 }, (_, hour) => ({
      hour: hour,
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      count: likesByHour[hour] || 0
    }));
  }, [contentTrends]);

  const maxDayCount = Math.max(...dayOfWeekData.map(d => d.count), 1);
  const maxHourCount = Math.max(...hourlyData.map(d => d.count), 1);

  // Get color intensity based on count using chart tokens
  const getColorIntensity = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity === 0) return "hsl(var(--chart-muted))";
    const opacity = 0.3 + intensity * 0.7;
    return `hsl(var(--chart-accent) / ${opacity.toFixed(2)})`;
  };

  const nUsed = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size ?? 0;

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle>Likes Activity Patterns</CardTitle>
        <CardDescription>
          When you liked videos by day and time • Based on last {nUsed} liked videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <LoadingSpinner className="h-96" label="Loading activity patterns" />
        ) : analyticsError ? (
          <div className="text-center text-destructive py-8">
            Error loading analytics data
          </div>
        ) : !contentTrends ? (
          <div className="text-center text-muted-foreground py-8">
            No temporal data available yet. Sync your YouTube liked videos to see patterns.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Day of Week Chart */}
            <div>
              <h3 className="text-sm font-semibold mb-4">By Day of Week</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-muted))" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {dayOfWeekData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorIntensity(entry.count, maxDayCount)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Chart */}
            <div>
              <h3 className="text-sm font-semibold mb-4">By Hour of Day</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-muted))" />
                  <XAxis
                    dataKey="hourLabel"
                    interval={2}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={(value) => `Hour: ${value}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {hourlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorIntensity(entry.count, maxHourCount)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Summary */}
            {contentTrends?.most_active_period && (
              <div className="text-sm text-muted-foreground text-center">
                Most active period: <span className="font-semibold text-foreground">{contentTrends.most_active_period}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
