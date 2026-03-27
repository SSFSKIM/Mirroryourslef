import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";
import { LoadingSpinner } from "./LoadingSpinner";

interface ShortsCircularProgressProps {
  className?: string;
}

export function ShortsCircularProgress({ className = "" }: ShortsCircularProgressProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  // Derive N and totals if available in alternative shapes
  const { nUsed, totalVideos, shortsPercentage } = React.useMemo(() => {
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    const shortsAnalysis = (analytics as any)?.shorts_analysis || (analytics as any)?.shortsAnalysis || (analytics as any)?.analytics?.shorts_analysis;
    const shortsCount = shortsAnalysis?.shorts_count ?? shortsAnalysis?.shortsCount ?? shortsAnalysis?.total_shorts ?? 0;
    const regularCount = shortsAnalysis?.regular_count ?? shortsAnalysis?.regularCount ?? shortsAnalysis?.total_regular ?? 0;
    const total = shortsCount + regularCount;
    const percentage = total > 0 ? (shortsCount / total) * 100 : 0;
    return {
      nUsed: (topLevelN as number) ?? total ?? 0,
      totalVideos: total,
      shortsPercentage: percentage
    };
  }, [analytics]);

  const regularPercentage = 100 - shortsPercentage;

  // Calculate the circle gradient angle based on percentage
  const getCircleStyle = (percentage: number) => {
    const angle = (percentage / 100) * 360;
    const accent = "hsl(var(--chart-accent))";
    const muted = "hsl(var(--chart-muted))";

    if (percentage >= 100) {
      return { backgroundImage: `conic-gradient(${accent} 0deg, ${accent} 360deg)` };
    }

    return {
      backgroundImage: `conic-gradient(${accent} 0deg, ${accent} ${angle}deg, ${muted} ${angle}deg, ${muted} 360deg)`
    };
  };

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle>Shorts vs Regular Videos</CardTitle>
        <CardDescription>
          Distribution of liked videos by content type • Based on last {nUsed} liked videos ({totalVideos} total)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {isAnalyticsLoading ? (
          <LoadingSpinner className="h-48" label="Loading shorts breakdown" />
        ) : analyticsError ? (
          <div className="py-8 text-center text-destructive">
            Error loading analytics data
          </div>
        ) : !analytics ? (
          <div className="text-center text-muted-foreground py-8">
            No data available yet. Sync your YouTube liked videos to see your distribution.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className="relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-full"
              style={getCircleStyle(shortsPercentage)}
            >
              <div className="absolute w-28 h-28 sm:w-40 sm:h-40 bg-card rounded-full flex items-center justify-center">
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
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--chart-accent))" }}></div>
                <span>Shorts ({Math.round(shortsPercentage)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-muted-foreground/30"></div>
                <span>Regular ({Math.round(regularPercentage)}%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
