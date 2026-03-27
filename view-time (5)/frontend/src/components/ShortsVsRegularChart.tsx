import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import useDataStore from 'utils/dataStore';
import { LoadingSpinner } from './LoadingSpinner';

interface ShortsVsRegularChartProps {
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartSummaryItem extends ChartData {
  percentage: number;
}

const ShortsVsRegularChart: React.FC<ShortsVsRegularChartProps> = ({ className }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const {
    analytics,
    analyticsSampleSize,
    isAnalyticsLoading,
    analyticsError,
    loadAnalytics,
    syncStatus,
  } = useDataStore();

  const desiredSampleSize = useMemo(() => (
    syncStatus?.sample_size ??
    syncStatus?.sampleSize ??
    syncStatus?.preferred_sample_size ??
    analyticsSampleSize ??
    100
  ), [analyticsSampleSize, syncStatus]);

  useEffect(() => {
    if (!analytics && !isAnalyticsLoading) {
      loadAnalytics(desiredSampleSize).catch((err) => {
        console.error('Error loading analytics for shorts chart:', err);
      });
    }
  }, [analytics, desiredSampleSize, isAnalyticsLoading, loadAnalytics]);

  useEffect(() => {
    if (!analytics) return;

    const analyticsPayload = 'analytics' in analytics && analytics.analytics
      ? analytics.analytics
      : analytics;

    const shortsAnalysis = analyticsPayload?.shorts_analysis
      ?? analyticsPayload?.shortsAnalysis;

    if (!shortsAnalysis) {
      setChartData([]);
      return;
    }

    const formatted: ChartData[] = [
      {
        name: 'Shorts',
        value: shortsAnalysis.total_shorts ?? shortsAnalysis.totalShorts ?? 0,
        color: 'hsl(var(--chart-1))'
      },
      {
        name: 'Long-form',
        value: shortsAnalysis.total_regular ?? shortsAnalysis.totalRegular ?? 0,
        color: 'hsl(var(--chart-accent))'
      }
    ];

    setChartData(formatted);
  }, [analytics]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const totalVideos = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  const summaryData = useMemo<ChartSummaryItem[]>(
    () => chartData.map((item) => ({
      ...item,
      percentage: totalVideos > 0 ? (item.value / totalVideos) * 100 : 0,
    })),
    [chartData, totalVideos]
  );

  const leadingType = useMemo(
    () => summaryData.reduce<ChartSummaryItem | null>(
      (leader, item) => (!leader || item.value > leader.value ? item : leader),
      null
    ),
    [summaryData]
  );

  if (isAnalyticsLoading && chartData.length === 0) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle>Shorts vs Long-form Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner className="h-[300px]" label="Loading shorts analysis" />
        </CardContent>
      </Card>
    );
  }

  if (analyticsError) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle>Shorts vs Long-form Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>{analyticsError.message || 'Failed to load data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle>Shorts vs Long-form Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No analytics data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Shorts vs Long-form Videos</CardTitle>
        <CardDescription>
          Distribution of video types in your liked videos ({totalVideos} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
          <div aria-hidden="true" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="hsl(var(--chart-4))"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} videos`,
                    name
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value: string) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                {leadingType?.name} currently leads your liked-video mix.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {leadingType
                  ? `${Math.round(leadingType.percentage)}% of your sampled likes are ${leadingType.name.toLowerCase()}.`
                  : 'No breakdown available yet.'}
              </p>
            </div>

            <dl className="space-y-3">
              {summaryData.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <dt className="font-medium text-foreground">{item.name}</dt>
                      <dd className="text-sm text-muted-foreground">
                        {item.value} videos
                      </dd>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {Math.round(item.percentage)}%
                    </p>
                    <p className="text-xs text-muted-foreground">of total</p>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortsVsRegularChart;
