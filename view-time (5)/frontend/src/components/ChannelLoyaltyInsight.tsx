import React from "react";
import { EditorialPanel } from "components/EditorialPanel";
import { Progress } from "@/components/ui/progress";
import useDataStore from "utils/dataStore";
import { Heart, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ChannelLoyaltyInsightProps {
  className?: string;
}

export function ChannelLoyaltyInsight({ className = "" }: ChannelLoyaltyInsightProps) {
  const { analytics, isAnalyticsLoading, analyticsError, loadAnalytics } = useDataStore();

  React.useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, [analytics, loadAnalytics]);

  const channelStats = analytics?.channel_stats || analytics?.channelStats;
  const diversityScore = channelStats?.channel_diversity_score || channelStats?.channelDiversityScore || 0;
  const totalUniqueChannels = channelStats?.total_unique_channels || channelStats?.totalUniqueChannels || 0;
  const avgLikesPerChannel = channelStats?.average_likes_per_channel || channelStats?.averageLikesPerChannel || 0;

  // Normalize diversity score to 0-100 range for visualization
  // Lower score = higher loyalty (concentrated on few channels)
  // Higher score = higher diversity (spread across many channels)
  const normalizedScore = Math.min(Math.abs(diversityScore) * 100, 100);

  // Determine loyalty vs diversity
  const isLoyaltyOriented = normalizedScore < 50;

  const getInterpretation = () => {
    if (normalizedScore < 30) {
      return {
        type: "High Loyalty",
        description: "You're highly loyal to a small set of favorite channels",
        icon: Heart,
        color: "text-destructive",
      };
    } else if (normalizedScore < 70) {
      return {
        type: "Balanced",
        description: "You have a balanced mix of favorite channels and exploration",
        icon: Heart,
        color: "text-foreground",
      };
    } else {
      return {
        type: "High Diversity",
        description: "You explore content from many different channels",
        icon: TrendingUp,
        color: "text-foreground",
      };
    }
  };

  const interpretation = getInterpretation();
  const Icon = interpretation.icon;

  return (
    <EditorialPanel tone="quiet" className={`flex h-full flex-col gap-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${interpretation.color}`} />
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Channel Preference Pattern
        </h3>
      </div>
      <p className="chart-caption text-sm text-muted-foreground">
        Analysis of your channel loyalty vs exploration habits
      </p>

      <div className="flex-1 border-t border-border/70 pt-5">
        {isAnalyticsLoading ? (
          <LoadingSpinner className="loading-state h-48" label="Loading channel loyalty" />
        ) : analyticsError ? (
          <div className="error-state py-8 text-center text-destructive">
            Error loading analytics data
          </div>
        ) : !channelStats ? (
          <div className="empty-state py-8 text-center text-muted-foreground">
            No channel data available yet. Sync your YouTube liked videos to see your pattern.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interpretation Badge */}
            <div className="rounded-lg border border-border/70 bg-paper p-4">
              <div className={`font-finding text-base font-bold ${interpretation.color} mb-1`}>
                {interpretation.type}
              </div>
              <div className="text-sm text-muted-foreground">
                {interpretation.description}
              </div>
            </div>

            {/* Loyalty vs Diversity Spectrum */}
            <div className="space-y-2">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>High Loyalty</span>
                <span>High Diversity</span>
              </div>
              <Progress
                value={normalizedScore}
                className="h-3"
              />
              <div className="mt-2 text-center text-sm font-medium">
                {isLoyaltyOriented ? 'Loyalty' : 'Diversity'} Score: <span className="font-data">{normalizedScore.toFixed(0)}%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/70 bg-paper p-3">
                <div className="section-eyebrow text-xs text-muted-foreground">Unique Channels</div>
                <div className="font-data text-2xl font-bold">{totalUniqueChannels}</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-paper p-3">
                <div className="section-eyebrow text-xs text-muted-foreground">Avg Likes/Channel</div>
                <div className="font-data text-2xl font-bold">{avgLikesPerChannel.toFixed(1)}</div>
              </div>
            </div>

            {/* Insight */}
            <div className="editorial-note border-t border-border/70 pt-4 text-xs text-muted-foreground">
              {isLoyaltyOriented ? (
                <>
                  <strong>What this means:</strong> You tend to stick with channels you trust and enjoy.
                  This suggests you value consistent quality and have strong channel preferences.
                </>
              ) : (
                <>
                  <strong>What this means:</strong> You actively explore content from various creators.
                  This suggests you're open to discovering new perspectives and diverse content.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </EditorialPanel>
  );
}
