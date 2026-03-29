import React from "react";
import { EditorialPanel } from "components/EditorialPanel";
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
    <EditorialPanel tone="quiet" className={`flex h-full flex-col gap-4 p-5 sm:p-6 ${className}`}>
      <div>
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Shorts vs Regular Videos
        </h3>
        <p className="chart-caption mt-1 text-xs text-muted-foreground">
          Based on last {nUsed} liked videos ({totalVideos} total)
        </p>
      </div>

      <div className="flex-1 border-t border-border/70 pt-4">
        {isAnalyticsLoading ? (
          <LoadingSpinner className="loading-state h-48" label="Loading shorts breakdown" />
        ) : analyticsError ? (
          <div className="error-state py-8 text-center text-destructive">
            Error loading analytics data
          </div>
        ) : !analytics ? (
          <div className="empty-state py-8 text-center text-muted-foreground">
            No data available yet. Sync your YouTube liked videos to see your distribution.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full sm:h-48 sm:w-48"
              style={getCircleStyle(shortsPercentage)}
            >
              <div className="absolute flex h-28 w-28 items-center justify-center rounded-full bg-[hsl(var(--paper-elevated)/0.82)] sm:h-40 sm:w-40">
                <div className="text-center">
                  <div className="font-data text-4xl font-bold">
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
                <div className="h-3 w-3 rounded" style={{ backgroundColor: "hsl(var(--chart-accent))" }}></div>
                <span>Shorts ({Math.round(shortsPercentage)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-muted-foreground/30"></div>
                <span>Regular ({Math.round(regularPercentage)}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </EditorialPanel>
  );
}
