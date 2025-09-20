import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";

// Custom tooltip component for video length distribution
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-card p-2 shadow-md border border-border rounded">
        <p className="font-bold">{label} minutes</p>
        <p>
          <span className="text-muted-foreground">Count: </span>
          <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface VideoLengthDistributionProps {
  className?: string;
}

export function VideoLengthDistribution({ className = "" }: VideoLengthDistributionProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();
  
  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);
  
  // Format data for the chart from duration analysis
  const formattedData = React.useMemo(() => {
    const distribution = (analytics as any)?.durationAnalysis?.distribution || (analytics as any)?.analytics?.durationAnalysis?.distribution;
    if (!distribution || !Array.isArray(distribution)) {
      // Create sample distribution buckets if no data available
      return [
        { range: "0-1", count: 0, label: "0-1" },
        { range: "1-5", count: 0, label: "1-5" },
        { range: "5-10", count: 0, label: "5-10" },
        { range: "10-20", count: 0, label: "10-20" },
        { range: "20-30", count: 0, label: "20-30" },
        { range: "30-60", count: 0, label: "30-60" },
        { range: "60+", count: 0, label: "60+" }
      ];
    }
    
    return distribution.map((item: any, index: number) => ({
      range: item.range || `${index * 5}-${(index + 1) * 5}`,
      count: item.count || 0,
      label: item.range || `${index * 5}-${(index + 1) * 5}`
    }));
  }, [analytics]);
  
  // Active N used for the analysis
  const nUsed = React.useMemo(() => {
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    if (typeof topLevelN === "number") return topLevelN;
    const sum = formattedData.reduce((acc, cur) => acc + (cur.count || 0), 0);
    return sum;
  }, [analytics, formattedData]);
  
  // Calculate maximum count for better Y-axis scaling
  const maxCount = React.useMemo(() => {
    if (!formattedData.length) return 100;
    const max = Math.max(...formattedData.map(item => item.count));
    return Math.ceil(max * 1.1); // Add 10% padding
  }, [formattedData]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Video Length Distribution</CardTitle>
        <CardDescription>
          Number of liked videos by length (in minutes) • Based on last {nUsed} liked videos
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
        ) : !formattedData || formattedData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No video length data available yet. Sync your YouTube liked videos to see distribution.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="label" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  domain={[0, maxCount]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#FF5252" 
                  radius={[2, 2, 0, 0]}
                  name="Video Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
