

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import useDataStore from 'utils/dataStore';

interface ShortsVsRegularChartProps {
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const ShortsVsRegularChart: React.FC<ShortsVsRegularChartProps> = ({ className }) => {
  const { analytics, isAnalyticsLoading, analyticsError } = useDataStore();

  // Prepare chart data from analytics
  const data: ChartData[] = [];
  if (analytics?.shorts_analysis) {
    const shortsAnalysis = analytics.shorts_analysis;
    data.push(
      {
        name: 'Shorts',
        value: shortsAnalysis.total_shorts || 0,
        color: '#3b82f6'
      },
      {
        name: 'Long-form',
        value: shortsAnalysis.total_regular || 0,
        color: '#ef4444'
      }
    );
  }

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

  if (isAnalyticsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Shorts vs Long-form Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Shorts vs Long-form Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>{analyticsError?.message || 'No analytics data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVideos = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Shorts vs Long-form Videos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of video types in your liked videos ({totalVideos} total)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
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
                formatter={(value: string, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortsVsRegularChart;
