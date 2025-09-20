import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Video } from 'lucide-react';
import useDataStore from 'utils/dataStore';

interface LikedVideosStatsProps {
  className?: string;
}

interface AnalyticsData {
  length_stats?: {
    average_length: number;
  };
  channel_stats?: {
    total_unique_channels: number;
  };
  shorts_analysis?: {
    shorts_percentage: number;
    total_shorts: number;
    total_regular: number;
  };
}

const LikedVideosStats: React.FC<LikedVideosStatsProps> = ({ className }) => {
  const {
    analytics,
    analyticsSampleSize,
    isAnalyticsLoading,
    analyticsError,
    loadAnalytics,
    syncStatus,
  } = useDataStore();

  const desiredSampleSize = React.useMemo(() => (
    syncStatus?.sample_size ??
    syncStatus?.sampleSize ??
    syncStatus?.preferred_sample_size ??
    analyticsSampleSize ??
    100
  ), [analyticsSampleSize, syncStatus]);

  React.useEffect(() => {
    if (!analytics && !isAnalyticsLoading) {
      loadAnalytics(desiredSampleSize).catch((err) => {
        console.error('Error loading analytics for stats:', err);
      });
    }
  }, [analytics, desiredSampleSize, isAnalyticsLoading, loadAnalytics]);

  const analyticsPayload: AnalyticsData | null = React.useMemo(() => {
    if (!analytics) return null;

    // Handle both raw analytics responses and direct analytics payloads
    if ('analytics' in analytics && analytics.analytics) {
      return analytics.analytics as AnalyticsData;
    }

    return analytics as AnalyticsData;
  }, [analytics]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  if (isAnalyticsLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>{analyticsError.message || 'Failed to load analytics data.'}</p>
      </div>
    );
  }

  if (!analyticsPayload) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>No analytics data available. Please sync your liked videos first.</p>
      </div>
    );
  }

  const averageLength = analyticsPayload.length_stats?.average_length
    ?? (analyticsPayload as any)?.lengthStats?.averageLength
    ?? 0;
  const totalChannels = analyticsPayload.channel_stats?.total_unique_channels
    ?? (analyticsPayload as any)?.channelStats?.totalUniqueChannels
    ?? 0;
  const shortsPercentage = analyticsPayload.shorts_analysis?.shorts_percentage
    ?? (analyticsPayload as any)?.shortsAnalysis?.shortsPercentage
    ?? 0;
  const totalShorts = analyticsPayload.shorts_analysis?.total_shorts
    ?? (analyticsPayload as any)?.shortsAnalysis?.totalShorts
    ?? 0;
  const totalRegular = analyticsPayload.shorts_analysis?.total_regular
    ?? (analyticsPayload as any)?.shortsAnalysis?.totalRegular
    ?? 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Average Video Length */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Video Length</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(averageLength)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on last {desiredSampleSize} liked videos
          </p>
        </CardContent>
      </Card>

      {/* Number of Unique Channels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Channels</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalChannels}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From last {desiredSampleSize} liked videos
          </p>
        </CardContent>
      </Card>

      {/* Shorts vs Long-form Ratio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Shorts vs Long-form</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{shortsPercentage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalShorts} shorts, {totalRegular} long-form (N = {desiredSampleSize})
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LikedVideosStats;
