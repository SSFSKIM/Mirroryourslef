import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";

interface VideoLengthDistributionProps {
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="custom-tooltip bg-card p-3 shadow-md border border-border rounded">
        <p className="font-bold text-sm mb-1">{data.label} minutes</p>
        <p className="text-base">
          <span className="text-muted-foreground mr-1">Videos watched:</span> 
          <span className="font-semibold">{data.count}</span>
        </p>
      </div>
    );
  }
  
  return null;
};

export function VideoLengthDistribution({ className = "" }: VideoLengthDistributionProps) {
  const { videoLengthDistribution, isVideoLengthDistributionLoading, videoLengthDistributionError, loadVideoLengthDistribution } = useDataStore();
  
  React.useEffect(() => {
    if (!videoLengthDistribution) {
      loadVideoLengthDistribution();
    }
  }, [videoLengthDistribution, loadVideoLengthDistribution]);
  
  // Format data for the chart
  const formattedData = React.useMemo(() => {
    if (!videoLengthDistribution) return [];
    
    return videoLengthDistribution.map(item => {
      // Get the range values from the item
      let rangeLabel = item.range;
      if (rangeLabel.includes('-')) {
        // It's a range like "0-5" or "5-10"
        rangeLabel = item.range;
      } else if (rangeLabel === "60+") {
        // It's the 60+ range
        rangeLabel = "60+";
      }
      
      return {
        range: item.range,
        count: item.count,
        label: rangeLabel,
        index: item.range.includes('60+') ? 12 : parseInt(item.range.split('-')[0]) / 5
      };
    }).sort((a, b) => a.index - b.index); // Ensure data is sorted by length
  }, [videoLengthDistribution]);
  
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
          Number of videos watched by length (in minutes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVideoLengthDistributionLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : videoLengthDistributionError ? (
          <div className="text-center text-red-500 py-8">
            Error loading video length distribution data
          </div>
        ) : !videoLengthDistribution || videoLengthDistribution.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No video data available yet. Sync your YouTube history to see your patterns.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="label"
                  angle={0}
                  textAnchor="middle"
                  height={50}
                >
                  <Label 
                    value="Video Length (minutes)" 
                    position="insideBottom" 
                    offset={-10}
                    style={{ textAnchor: 'middle', fill: 'var(--muted-foreground)' }}
                  />
                </XAxis>
                <YAxis 
                  domain={[0, maxCount]}
                >
                  <Label 
                    value="Number of Videos" 
                    angle={-90} 
                    position="insideLeft"
                    style={{ textAnchor: 'middle', fill: 'var(--muted-foreground)' }}
                    offset={-5}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 82, 82, 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar 
                  dataKey="count" 
                  name="Videos Watched" 
                  fill="#FF5252"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
