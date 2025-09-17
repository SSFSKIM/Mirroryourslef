import React from "react";
import { Card, CardContent } from "components/Card";

interface Props {
  className?: string;
}

export function HeatMapPreview({ className }: Props) {
  // Mock data for the heat map preview
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["1", "5", "9", "12", "5", "9"];

  return (
    <Card className={`${className} overflow-hidden bg-card/70 backdrop-blur-sm`}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Watch Time Heatmap</h3>
        <div className="grid grid-cols-7 gap-1">
          {/* Column headers (days) */}
          {days.map((day, i) => (
            <div key={`day-${i}`} className="text-xs text-center text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Generate 7x6 grid for days and hours */}
          {Array.from({ length: 42 }).map((_, i) => {
            // Calculate intensity (more intense for certain patterns)
            const dayIndex = i % 7;
            const hourIndex = Math.floor(i / 7);
            
            // Create some patterns of usage
            let intensity = 0;
            if ((dayIndex < 5 && hourIndex === 4) || // Weekdays evening
                (dayIndex >= 5 && hourIndex < 3)) {   // Weekend mornings
              intensity = 0.8 + Math.random() * 0.2; 
            } else if (dayIndex < 5 && hourIndex === 2) { // Weekday lunch
              intensity = 0.4 + Math.random() * 0.3;
            } else if (Math.random() > 0.7) { // Random spots
              intensity = 0.1 + Math.random() * 0.3;
            }

            // Skip certain cells to create a realistic pattern
            if ((dayIndex === 6 && hourIndex === 5) || 
                (dayIndex === 5 && hourIndex === 5) ||
                (dayIndex === 0 && hourIndex === 5)) {
              intensity = 0;
            }

            const bgColor = intensity === 0 
              ? 'bg-transparent' 
              : `bg-red-${Math.min(Math.floor(intensity * 600), 600)}`;
              
            return (
              <div 
                key={`cell-${i}`} 
                className={`w-full aspect-square rounded-sm ${intensity > 0 ? bgColor : 'bg-secondary/30'}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
