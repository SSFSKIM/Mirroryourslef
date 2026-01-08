import React, { useEffect } from "react";
import { useAuthStore } from "utils/auth";
import { UserProfile } from "components/UserProfile";
import YouTubeSyncButton from "components/YouTubeSyncButton";
import LikedVideosStats from "components/LikedVideosStats";
import ShortsVsRegularChart from "components/ShortsVsRegularChart";
import { TopKeywords } from "components/TopKeywords";
import { VideoLengthDistribution } from "components/VideoLengthDistribution";
import { TopChannels } from "components/TopChannels";
import { LikesTimeHeatmap } from "components/LikesTimeHeatmap";
import { MonthlyTrendsChart } from "components/MonthlyTrendsChart";
import { ChannelLoyaltyInsight } from "components/ChannelLoyaltyInsight";
import { CategoryDistribution } from "components/CategoryDistribution";
import { ShortsCircularProgress } from "components/ShortsCircularProgress";
import WatchHistoryUploadCard from "components/WatchHistoryUploadCard";
import { WatchHistoryHighlights } from "components/WatchHistoryHighlights";
import { ViewingHeatmap } from "components/ViewingHeatmap";
import { RepeatWatchList } from "components/RepeatWatchList";
import { InAppNudges } from "components/InAppNudges";
import { RecommendationBreakdown } from "components/RecommendationBreakdown";
import { SessionDurationChart } from "components/SessionDurationChart";
import useWatchHistoryStore from "utils/watchHistoryStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { loadStatus, loadAnalytics, status, analytics } = useWatchHistoryStore();
  const hasWatchHistory = Boolean(status?.total_events && status.total_events > 0 && analytics);

  useEffect(() => {
    // Initialize Firebase on component mount
    import("utils/auth").then(() => {
      // Only log in development
      console.log("Firebase authentication initialized in Dashboard");
    });
  }, []);

  // Load status once when user becomes available or status is missing
  useEffect(() => {
    if (user && !status) {
      loadStatus();
    }
  }, [user, status, loadStatus]);

  // Load analytics only after processing is completed and events exist
  useEffect(() => {
    const hasEvents = (status?.total_events ?? 0) > 0;
    const isReady = status?.processing_state === "completed";
    if (user && hasEvents && isReady && !analytics) {
      loadAnalytics();
    }
  }, [user, status, analytics, loadAnalytics]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="MirrorYourself Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">MirrorYourself</h1>
          </div>
          <UserProfile />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome to your YouTube analytics dashboard!</p>

        <Tabs defaultValue="liked-videos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="liked-videos" className="text-sm sm:text-base">
              Liked Videos
            </TabsTrigger>
            <TabsTrigger value="watch-history" className="text-sm sm:text-base">
              Watch History
            </TabsTrigger>
          </TabsList>

          {/* Liked Videos Tab */}
          <TabsContent value="liked-videos" className="space-y-8">
            {/* YouTube Sync Section */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Data Synchronization</h2>
              <YouTubeSyncButton />
            </div>

            {/* Liked Videos Overview */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Overview</h2>
              <LikedVideosStats className="mb-6" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ShortsVsRegularChart />
                <CategoryDistribution className="w-full h-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChannelLoyaltyInsight className="w-full h-full" />
              </div>
            </div>

            {/* Detailed Analytics */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Detailed Analytics</h2>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 xl:col-span-3">
                  <TopKeywords className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 lg:col-span-1 xl:col-span-2">
                  <VideoLengthDistribution className="w-full h-full" />
                </div>
                <div className="col-span-1">
                  <ShortsCircularProgress className="w-full h-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <MonthlyTrendsChart className="w-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopChannels className="w-full h-full" limit={10} />
                <LikesTimeHeatmap className="w-full h-full" />
              </div>
            </div>
          </TabsContent>

          {/* Watch History Tab */}
          <TabsContent value="watch-history" className="space-y-8">
            {/* Upload Section */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Upload Your Data</h2>
              <WatchHistoryUploadCard />
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Key Metrics</h2>
              <WatchHistoryHighlights />
            </div>

            {/* Detailed Insights */}
            {hasWatchHistory && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Detailed Insights</h2>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                  <SessionDurationChart className="w-full" />
                  <RecommendationBreakdown className="w-full" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                  <ViewingHeatmap className="w-full" />
                  <InAppNudges className="w-full" />
                </div>

                <RepeatWatchList />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
