
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useDataStore from "utils/dataStore";

interface KeywordAnalysisProps {
  className?: string;
}

export function WatchTimeHeatMap({ className = "" }: KeywordAnalysisProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();
  
  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);
  
  const keywords = analytics?.keywordAnalysis?.topKeywords || [];
  
  // Function to get badge color based on frequency rank
  const getBadgeVariant = (index: number) => {
    if (index < 3) return "default"; // Top 3 keywords
    if (index < 6) return "secondary"; // Next 3 keywords
    return "outline"; // Rest of keywords
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Keywords</CardTitle>
        <CardDescription>
          Most frequent keywords from your liked video titles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading analytics data
          </div>
        ) : !keywords || keywords.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No keyword data available yet. Sync your YouTube liked videos to see analysis.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 20).map((keyword, index) => (
                <Badge 
                  key={keyword.keyword} 
                  variant={getBadgeVariant(index)}
                  className="text-sm py-1 px-3"
                >
                  {keyword.keyword} ({keyword.frequency})
                </Badge>
              ))}
            </div>
            {keywords.length > 20 && (
              <div className="text-center text-sm text-muted-foreground">
                And {keywords.length - 20} more keywords...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
