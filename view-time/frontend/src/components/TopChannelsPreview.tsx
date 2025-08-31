import React from "react";
import { Card, CardContent } from "components/Card";

interface Props {
  className?: string;
}

export function TopChannelsPreview({ className }: Props) {
  // Mock data for top channels
  const channels = [
    { id: 1, name: "Channel 1", watchTime: 75 },
    { id: 2, name: "Channel 2", watchTime: 68 },
    { id: 3, name: "Channel 3", watchTime: 62 },
  ];

  // Find the max watch time for calculating percentages
  const maxWatchTime = Math.max(...channels.map(c => c.watchTime));

  return (
    <Card className={`${className} overflow-hidden bg-card/70 backdrop-blur-sm`}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Top Channels</h3>
        <div className="space-y-3">
          {channels.map((channel, index) => {
            const percentage = (channel.watchTime / maxWatchTime) * 100;
            
            return (
              <div key={channel.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full bg-blue-${(index + 3) * 100} flex items-center justify-center text-xs`}>
                      {channel.id}
                    </div>
                    <span className="ml-2 text-xs">{channel.name}</span>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
