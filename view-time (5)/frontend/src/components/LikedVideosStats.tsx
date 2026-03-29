import React from 'react';
import { StatCard } from './StatCard';
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
      <div className={`loading-state grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-paper p-6">
            <div className="mb-4 h-3 w-24 rounded bg-muted"></div>
            <div className="mb-2 h-10 w-20 rounded bg-muted"></div>
            <div className="h-3 w-28 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className={`error-state p-4 text-center text-muted-foreground ${className}`}>
        <p>{analyticsError.message || 'Failed to load analytics data.'}</p>
      </div>
    );
  }

  if (!analyticsPayload) {
    return (
      <div className={`empty-state p-4 text-center text-muted-foreground ${className}`}>
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
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
      <StatCard
        label="Average Video Length"
        value={formatDuration(averageLength)}
        subtitle={`Based on last ${desiredSampleSize} liked videos`}
        icon={Clock}
      />

      <StatCard
        label="Unique Channels"
        value={totalChannels}
        subtitle={`From last ${desiredSampleSize} liked videos`}
        icon={Users}
      />

      <StatCard
        label="Shorts vs Long-form"
        value={`${shortsPercentage.toFixed(1)}%`}
        subtitle={`${totalShorts} shorts, ${totalRegular} long-form (N = ${desiredSampleSize})`}
        icon={Video}
      />
    </div>
  );
};

export default LikedVideosStats;
