import React from "react";

interface Props {
  className?: string;
}

export function DonutChartPreview({ className }: Props) {
  // Mock data for categories
  const categories = [
    { name: "Gaming", percentage: 47, color: "hsl(var(--chart-1))" },
    { name: "Music", percentage: 26, color: "hsl(var(--chart-2))" },
    { name: "Cooking", percentage: 18, color: "hsl(var(--chart-5))" },
    { name: "Other", percentage: 9, color: "hsl(var(--chart-3))" }
  ];

  // Calculate the circumference and stroke dasharray for each segment
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold font-display mb-3 tracking-tight">
        Category Distribution
      </h3>
      <div className="flex justify-center items-center gap-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              style={{ stroke: "hsl(var(--rule))" }}
              strokeWidth="10"
            />

            {/* Category segments */}
            {categories.map((category, index) => {
              const startPercentage = accumulatedPercentage;
              accumulatedPercentage += category.percentage;

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
              className="text-xs font-data fill-foreground"
            >
              DNA
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="text-xs space-y-2">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-ink-soft">{category.name}</span>
              <span className="font-data text-foreground">{category.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
