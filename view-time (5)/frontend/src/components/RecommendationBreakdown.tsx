import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useWatchHistoryStore from "utils/watchHistoryStore";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6"];

export const RecommendationBreakdown: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { analytics, isLoadingAnalytics } = useWatchHistoryStore();

  const data = React.useMemo(() => {
    if (!analytics?.recommendation_breakdown) {
      return [];
    }

    const total = Object.values(analytics.recommendation_breakdown).reduce(
      (acc: number, value: number) => acc + value,
      0,
    );

    return Object.entries(analytics.recommendation_breakdown)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total ? Number(((value / total) * 100).toFixed(1)) : 0,
      }))
      .slice(0, 10);
  }, [analytics?.recommendation_breakdown]);

  if (isLoadingAnalytics) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader>
          <CardTitle>Recommendation Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics || !data.length) {
    return (
      <Card className={className}>
        <CardHeader className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Recommendation Sources</CardTitle>
            <CardDescription>Upload your watch history to see how each surface influences your viewing.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recommendation Sources</CardTitle>
        <CardDescription>Top surfaces that led you to watch — higher bars mean more plays.</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any, _name, props) => {
              const payload = props?.payload as { percentage: number; value: number } | undefined;
              if (!payload) {
                return [value, "Views"];
              }
              return [`${payload.value} views (${payload.percentage}%)`, "Views"];
            }} />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}> 
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RecommendationBreakdown;
