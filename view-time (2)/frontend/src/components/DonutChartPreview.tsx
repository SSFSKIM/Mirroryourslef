import React from "react";
import { Card, CardContent } from "components/Card";

interface Props {
  className?: string;
}

export function DonutChartPreview({ className }: Props) {
  // Mock data for categories
  const categories = [
    { name: "Gaming", percentage: 47, color: "#f44336" }, // red
    { name: "Music", percentage: 26, color: "#3b82f6" },  // blue
    { name: "Cooking", percentage: 18, color: "#16a34a" }, // green
    { name: "Other", percentage: 9, color: "#fb923c" }    // orange
  ];

  // Calculate the circumference and stroke dasharray for each segment
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <Card className={`${className} overflow-hidden bg-card/70 backdrop-blur-sm`}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Category Distribution</h3>
        <div className="flex justify-center items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                className="stroke-gray-800"
                strokeWidth="10"
              />
              
              {/* Category segments */}
              {categories.map((category, index) => {
                const startPercentage = accumulatedPercentage;
                accumulatedPercentage += category.percentage;
                
                const startAngle = (startPercentage / 100) * 360;
                const endAngle = (accumulatedPercentage / 100) * 360;
                const dashArray = (category.percentage / 100) * circumference;
                const dashOffset = ((100 - startPercentage) / 100) * circumference;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={category.color}
                    strokeWidth="10"
                    strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                  />
                );
              })}
              
              {/* Center text */}
              <text 
                x="50" 
                y="50" 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="text-xl font-bold fill-white"
              >
                Chart
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="ml-4 text-xs space-y-1">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 mr-1 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
