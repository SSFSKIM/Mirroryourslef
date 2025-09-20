import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useWatchHistoryStore from "utils/watchHistoryStore";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HOURS = Array.from({ length: 24 }, (_, index) => index);

const heatColor = (value: number, max: number): string => {
  if (max === 0) {
    return "rgba(220, 38, 38, 0.05)";
  }
  const intensity = 0.15 + (value / max) * 0.75;
  return `rgba(220, 38, 38, ${intensity.toFixed(2)})`;
};

interface ViewingHeatmapProps {
  className?: string;
}

export const ViewingHeatmap: React.FC<ViewingHeatmapProps> = ({ className = "" }) => {
  const { analytics } = useWatchHistoryStore();

  const { cells, maxValue } = useMemo(() => {
    const base = { cells: new Map<string, number>(), maxValue: 0 };
    if (!analytics?.heatmap) {
      return base;
    }

    const map = new Map<string, number>();
    let localMax = 0;

    Object.entries(analytics.heatmap).forEach(([weekday, values]) => {
      Object.entries(values).forEach(([hour, count]) => {
        const key = `${weekday}-${hour}`;
        map.set(key, count as number);
        if ((count as number) > localMax) {
          localMax = count as number;
        }
      });
    });

    return { cells: map, maxValue: localMax };
  }, [analytics]);

  if (!analytics) {
    return null;
  }

  const hasHeatmap = analytics.heatmap && Object.keys(analytics.heatmap).length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Viewing Heatmap</CardTitle>
        <CardDescription>When you watch the most. Darker cells indicate heavier viewing.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {!hasHeatmap ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            We need a bit more history to surface time-of-day insights.
          </div>
        ) : (
          <div className="min-w-[768px]">
            <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-xs">
              <div />
              {HOURS.map((hour) => (
                <div key={hour} className="text-center text-muted-foreground">
                  {hour}
                </div>
              ))}
              {DAY_LABELS.map((label, index) => (
                <React.Fragment key={label}>
                  <div className="flex items-center justify-start pr-2 font-medium">{label}</div>
                  {HOURS.map((hour) => {
                    const key = `${index}-${hour}`;
                    const count = cells.get(key) ?? 0;
                    const background = heatColor(count, maxValue);
                    return (
                      <div
                        key={key}
                        className="flex h-6 items-center justify-center rounded"
                        style={{ backgroundColor: background }}
                        title={`${label} @ ${hour}:00 · ${count} views`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewingHeatmap;
