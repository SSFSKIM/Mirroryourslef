import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useDataStore from "utils/dataStore";

interface WatchThroughPercentageProps {
  className?: string;
}

export function WatchThroughPercentage({ className = "" }: WatchThroughPercentageProps) {
  const { 
    averageWatchThroughPercentage, 
    isAverageWatchThroughLoading, 
    averageWatchThroughError, 
    loadAverageWatchThrough 
  } = useDataStore();
  
  React.useEffect(() => {
    if (averageWatchThroughPercentage === null) {
      loadAverageWatchThrough();
    }
  }, [averageWatchThroughPercentage, loadAverageWatchThrough]);
  
  // Calculate the circle gradient angle based on percentage
  const getCircleStyle = (percentage: number) => {
    const angle = (percentage / 100) * 360;
    
    if (percentage >= 100) {
      return { backgroundImage: `conic-gradient(#FF5252 0deg, #FF5252 360deg)` };
    }
    
    return {
      backgroundImage: `conic-gradient(#FF5252 0deg, #FF5252 ${angle}deg, #2A2A2A ${angle}deg, #2A2A2A 360deg)`
    };
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Average Watch-Through</CardTitle>
        <CardDescription>
          Average percentage of videos watched before stopping
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {isAverageWatchThroughLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : averageWatchThroughError ? (
          <div className="text-center text-red-500 py-8">
            Error loading watch-through data
          </div>
        ) : averageWatchThroughPercentage === null ? (
          <div className="text-center text-muted-foreground py-8">
            No watch-through data available yet. Sync your YouTube history to see your patterns.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div 
              className="relative flex items-center justify-center w-48 h-48 rounded-full" 
              style={getCircleStyle(averageWatchThroughPercentage)}
            >
              <div className="absolute w-40 h-40 bg-card rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {Math.round(averageWatchThroughPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average completion
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {averageWatchThroughPercentage > 80 ? (
                "You tend to watch videos to completion"
              ) : averageWatchThroughPercentage > 60 ? (
                "You watch most of the videos you start"
              ) : averageWatchThroughPercentage > 40 ? (
                "You watch about half of each video"
              ) : (
                "You often skip through videos quickly"
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
