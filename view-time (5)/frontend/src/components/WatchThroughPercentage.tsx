import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";

interface ShortsDistributionProps {
  className?: string;
}

export function WatchThroughPercentage({ className = "" }: ShortsDistributionProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();
  
  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);
  
  const shortsPercentage = analytics?.shortsPercentage || 0;
  const regularPercentage = 100 - shortsPercentage;

  // Derive N and totals if available in alternative shapes
  const { nUsed, totalVideos } = React.useMemo(() => {
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    const shortsAnalysis = (analytics as any)?.shortsAnalysis || (analytics as any)?.analytics?.shorts_analysis;
    const total = (shortsAnalysis?.shortsCount ?? shortsAnalysis?.total_shorts ?? 0) +
                  (shortsAnalysis?.regularCount ?? shortsAnalysis?.total_regular ?? 0);
    return {
      nUsed: (topLevelN as number) ?? total ?? 0,
      totalVideos: total
    };
  }, [analytics]);
  
  // Calculate the circle gradient angle based on percentage
  const getCircleStyle = (percentage: number) => {
    const angle = (percentage / 100) * 360;
    
    if (percentage >= 100) {
      return { backgroundImage: `conic-gradient(#FF5252 0deg, #FF5252 360deg)` };
    }
    
    return {
      backgroundImage: `conic-gradient(#FF5252 0deg, #FF5252 ${angle}deg, #E2E8F0 ${angle}deg, #E2E8F0 360deg)`
    };
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Shorts vs Regular Videos</CardTitle>
        <CardDescription>
          Distribution of liked videos by content type • Based on last {nUsed} liked videos ({totalVideos} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {isAnalyticsLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading analytics data
          </div>
        ) : !analytics ? (
          <div className="text-center text-muted-foreground py-8">
            No data available yet. Sync your YouTube liked videos to see your distribution.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div 
              className="relative flex items-center justify-center w-48 h-48 rounded-full" 
              style={getCircleStyle(shortsPercentage)}
            >
              <div className="absolute w-40 h-40 bg-card rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {Math.round(shortsPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Shorts
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Shorts ({Math.round(shortsPercentage)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Regular ({Math.round(regularPercentage)}%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
