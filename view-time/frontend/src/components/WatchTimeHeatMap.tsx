import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";

interface WatchTimeHeatMapProps {
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

// Custom tooltip for the heatmap
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formattedHour = data.hour < 10 ? `0${data.hour}:00` : `${data.hour}:00`;
    const formattedValue = Math.round(data.value * 10) / 10; // Round to 1 decimal place
    
    return (
      <div className="custom-tooltip bg-card p-2 shadow-md border border-border rounded">
        <p className="font-bold">{dayNames[data.day]} at {formattedHour}</p>
        <p><span className="text-muted-foreground">Watch time:</span> {formattedValue} minutes</p>
      </div>
    );
  }
  
  return null;
};

export function WatchTimeHeatMap({ className = "" }: WatchTimeHeatMapProps) {
  const { watchTimeHeatmap, isWatchTimeHeatmapLoading, watchTimeHeatmapError, loadWatchTimeHeatmap } = useDataStore();
  
  React.useEffect(() => {
    if (!watchTimeHeatmap) {
      loadWatchTimeHeatmap();
    }
  }, [watchTimeHeatmap, loadWatchTimeHeatmap]);
  
  // Function to generate proper color based on value
  const getColor = (value: number) => {
    // Using red scale as per design requirements
    // Higher intensity for higher watch time
    const maxValue = Math.max(...(watchTimeHeatmap?.map(item => item.value) || [1]));
    const normalizedValue = Math.min(value / maxValue, 1); // Normalize value between 0 and 1
    
    // Return color from a red scale - darker red means more watch time
    if (normalizedValue < 0.1) return "#FFEBE9"; // Very light red
    if (normalizedValue < 0.3) return "#FFCCCB"; // Light red
    if (normalizedValue < 0.5) return "#FF8A80"; // Medium red
    if (normalizedValue < 0.7) return "#FF5252"; // Bright red
    if (normalizedValue < 0.9) return "#D50000"; // Dark red
    return "#B71C1C"; // Very dark red
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Watch Time Heatmap</CardTitle>
        <CardDescription>
          Your watch activity by day of week and hour of day
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isWatchTimeHeatmapLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : watchTimeHeatmapError ? (
          <div className="text-center text-red-500 py-8">
            Error loading watch time data
          </div>
        ) : !watchTimeHeatmap || watchTimeHeatmap.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No watch time data available yet. Sync your YouTube history to see your patterns.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
              >
                <XAxis 
                  type="number" 
                  dataKey="hour" 
                  name="Hour" 
                  domain={[0, 23]}
                  tickCount={12}
                  tickFormatter={(hour) => `${hour}`}
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="day" 
                  name="Day" 
                  domain={[0, 6]}
                  tickCount={7}
                  tickFormatter={(day) => {
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    return days[day];
                  }}
                  label={{ value: 'Day of Week', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number"
                  dataKey="value"
                  range={[50, 500]}
                  name="Watch Time"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
                <Scatter data={watchTimeHeatmap} fill="#FF0000">
                  {watchTimeHeatmap.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.value)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
