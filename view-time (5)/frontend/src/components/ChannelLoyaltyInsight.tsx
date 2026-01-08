import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useDataStore from "utils/dataStore";
import { Heart, TrendingUp } from "lucide-react";

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
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-900/20"
      };
    } else if (normalizedScore < 70) {
      return {
        type: "Balanced",
        description: "You have a balanced mix of favorite channels and exploration",
        icon: Heart,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
      };
    } else {
      return {
        type: "High Diversity",
        description: "You explore content from many different channels",
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      };
    }
  };

  const interpretation = getInterpretation();
  const Icon = interpretation.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${interpretation.color}`} />
          Channel Preference Pattern
        </CardTitle>
        <CardDescription>
          Analysis of your channel loyalty vs exploration habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyticsLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : analyticsError ? (
          <div className="text-center text-red-500 py-8">
            Error loading analytics data
          </div>
        ) : !channelStats ? (
          <div className="text-center text-muted-foreground py-8">
            No channel data available yet. Sync your YouTube liked videos to see your pattern.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interpretation Badge */}
            <div className={`p-4 rounded-lg ${interpretation.bgColor}`}>
              <div className={`text-lg font-bold ${interpretation.color} mb-1`}>
                {interpretation.type}
              </div>
              <div className="text-sm text-muted-foreground">
                {interpretation.description}
              </div>
            </div>

            {/* Loyalty vs Diversity Spectrum */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>High Loyalty</span>
                <span>High Diversity</span>
              </div>
              <Progress
                value={normalizedScore}
                className="h-3"
              />
              <div className="text-center text-sm font-medium mt-2">
                {isLoyaltyOriented ? 'Loyalty' : 'Diversity'} Score: {normalizedScore.toFixed(0)}%
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Unique Channels</div>
                <div className="text-2xl font-bold">{totalUniqueChannels}</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Avg Likes/Channel</div>
                <div className="text-2xl font-bold">{avgLikesPerChannel.toFixed(1)}</div>
              </div>
            </div>

            {/* Insight */}
            <div className="text-xs text-muted-foreground border-t pt-4">
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
      </CardContent>
    </Card>
  );
}
