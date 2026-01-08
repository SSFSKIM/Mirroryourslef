import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";
import { Button } from "@/components/ui/button";

interface CategoryDistributionProps {
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

// Custom tooltip for category distribution
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-card p-2 shadow-md border border-border rounded">
        <p className="font-bold">{data.category}</p>
        <p><span className="text-muted-foreground">Videos:</span> {data.count} videos</p>
        <p><span className="text-muted-foreground">Percentage:</span> {Math.round(data.percentage)}%</p>
      </div>
    );
  }
  
  return null;
};

// Colors for different categories
const COLORS = [
  '#FF5252', // Primary red
  '#D50000',
  '#FF1744',
  '#FF8A80',
  '#B71C1C',
  '#C62828',
  '#D32F2F',
  '#E53935',
  '#F44336',
  '#EF5350',
  '#E57373',
  '#EF9A9A',
  '#FFCDD2',
  '#FFEBEE',
  '#C2185B', // Adding some complementary colors for better contrast
  '#880E4F',
  '#AD1457',
  '#D81B60',
  '#EC407A',
  '#F06292',
];

export function CategoryDistribution({ className = "" }: CategoryDistributionProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics, loadSyncStatus } = useDataStore();
  
  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);
  
  const categoryDistribution = analytics?.categoryBreakdown || [];
  
  const formattedData = React.useMemo(() => {
    if (!Array.isArray(categoryDistribution) || categoryDistribution.length === 0) {
      return [];
    }

    const totalCount = categoryDistribution.reduce((acc: number, curr: any) => acc + (curr?.count ?? 0), 0) || 1;

    return categoryDistribution
      .map((item: any) => {
        const count = typeof item?.count === "number" ? item.count : Number(item?.count ?? 0);
        const percentage = typeof item?.percentage === "number"
          ? item.percentage
          : (count / totalCount) * 100;
        const totalWatchTime = typeof item?.totalWatchTime === "number"
          ? item.totalWatchTime
          : Number(item?.total_watch_time ?? 0);

        return {
          category: item?.category ?? "Other",
          count,
          percentage,
          totalWatchTime,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [categoryDistribution]);
  
  // Derive active sample size (N)
  const nUsed = React.useMemo(() => {
    const totalCount = categoryDistribution?.reduce?.((acc: number, curr: any) => acc + (curr?.count || 0), 0) || 0;
    // Support both shapes: full response or flattened analytics
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    return (topLevelN as number) ?? totalCount ?? 0;
  }, [analytics, categoryDistribution]);

  const topCategories = React.useMemo(() => formattedData.slice(0, 3), [formattedData]);

  const aggregateWatchTime = React.useMemo(
    () => formattedData.reduce((acc, curr) => acc + (curr.totalWatchTime || 0), 0),
    [formattedData]
  );

  const formatWatchTime = React.useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return null;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }, []);

  const readableWatchTime = React.useMemo(
    () => formatWatchTime(aggregateWatchTime),
    [aggregateWatchTime, formatWatchTime]
  );
  
  // Custom label renderer for the donut chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show labels for small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>
          Liked videos share by category • Based on last {nUsed} liked videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading analytics data
          </div>
        ) : formattedData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No category data available yet. Sync your YouTube liked videos to see your distribution.</p>
            <Button className="mt-4" variant="outline" onClick={() => void loadSyncStatus()}>
              Sync liked videos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-72 w-full" role="img" aria-label="Liked videos by category">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#FF5252"
                    dataKey="count"
                    nameKey="category"
                  >
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-${entry.category}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {topCategories.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>
                  Top categories:{" "}
                  {topCategories
                    .map((cat) => `${cat.category} (${Math.round(cat.percentage)}%)`)
                    .join(" • ")}
                </p>
                {readableWatchTime && (
                  <p className="mt-1">
                    Covers approximately {readableWatchTime} of liked content.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
