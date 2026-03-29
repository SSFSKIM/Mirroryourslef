import React from "react";
import { AnalyticsPanel } from "components/AnalyticsPanel";
import { Badge } from "@/components/ui/badge";
import useDataStore from "utils/dataStore";
import { LoadingSpinner } from "./LoadingSpinner";

interface TopKeywordsProps {
  className?: string;
}

export function TopKeywords({ className = "" }: TopKeywordsProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  const keywordAnalysis = analytics?.keyword_analysis || analytics?.keywordAnalysis;
  const topKeywordsData = keywordAnalysis?.top_keywords || keywordAnalysis?.topKeywords;

  // Transform dict format {keyword: frequency} to list of objects [{keyword, frequency}]
  const keywords = React.useMemo(() => {
    if (!topKeywordsData) return [];

    // If it's already an array, return it
    if (Array.isArray(topKeywordsData)) {
      return topKeywordsData;
    }

    // If it's a dict, convert to array and sort by frequency
    if (typeof topKeywordsData === 'object') {
      return Object.entries(topKeywordsData)
        .map(([keyword, frequency]) => ({ keyword, frequency: frequency as number }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20);
    }

    return [];
  }, [topKeywordsData]);

  // Derive active sample size (N)
  const nUsed = React.useMemo(() => {
    const topLevelN = (analytics as any)?.sample_size ?? (analytics as any)?.analytics?.sample_size;
    if (typeof topLevelN === "number") return topLevelN;
    // Fallback: total unique videos that contributed keywords
    const totalVideos = (analytics as any)?.totalVideos ?? keywords.length ?? 0;
    return totalVideos;
  }, [analytics, keywords]);

  // Function to get badge style based on frequency rank
  const getBadgeVariant = (index: number) => {
    if (index < 3) return "default"; // Top 3 keywords
    if (index < 6) return "secondary"; // Next 3 keywords
    return "outline"; // Rest of keywords
  };

  return (
    <AnalyticsPanel
      title="Top Keywords"
      caption={`Most frequent terms from your liked video titles \u00b7 Based on last ${nUsed} liked videos`}
      className={className}
    >
      {isAnalyticsLoading ? (
        <LoadingSpinner className="loading-state h-48" label="Loading keywords" />
      ) : analyticsError ? (
        <div className="error-state py-8 text-center text-destructive">
          Error loading analytics data
        </div>
      ) : !keywords || keywords.length === 0 ? (
        <div className="empty-state py-8 text-center text-muted-foreground">
          No keyword data available yet. Sync your YouTube liked videos to see analysis.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {keywords.slice(0, 20).map((keyword, index) => (
              <Badge
                key={keyword.keyword}
                variant={getBadgeVariant(index)}
                className="rounded-sm px-3 py-1 font-mono text-sm tracking-tight"
              >
                <span className="mr-1.5 text-xs text-muted-foreground">{index + 1}.</span>
                {keyword.keyword}
                <span className="ml-1.5 text-xs text-muted-foreground">({keyword.frequency})</span>
              </Badge>
            ))}
          </div>
          {keywords.length > 20 && (
            <p className="chart-caption text-center text-sm text-muted-foreground">
              And {keywords.length - 20} more keywords...
            </p>
          )}
        </div>
      )}
    </AnalyticsPanel>
  );
}
