import React, { useEffect } from "react";
import { useAuthStore } from "utils/auth";
import { UserProfile } from "components/UserProfile";
import YouTubeSyncButton from "components/YouTubeSyncButton";
import LikedVideosStats from "components/LikedVideosStats";
import ShortsVsRegularChart from "components/ShortsVsRegularChart";
import { WatchTimeHeatMap } from "components/WatchTimeHeatMap";
import { VideoLengthDistribution } from "components/VideoLengthDistribution";
import { TopChannels } from "components/TopChannels";
import { CategoryDistribution } from "components/CategoryDistribution";
import { WatchThroughPercentage } from "components/WatchThroughPercentage";
import WatchHistoryUploadCard from "components/WatchHistoryUploadCard";
import { WatchHistoryHighlights } from "components/WatchHistoryHighlights";
import { ViewingHeatmap } from "components/ViewingHeatmap";
import { RepeatWatchList } from "components/RepeatWatchList";
import { InAppNudges } from "components/InAppNudges";
import { RecommendationBreakdown } from "components/RecommendationBreakdown";
import { SessionDurationChart } from "components/SessionDurationChart";
import useWatchHistoryStore from "utils/watchHistoryStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { loadStatus, loadAnalytics, status, analytics } = useWatchHistoryStore();
  const hasWatchHistory = Boolean(status?.total_events && status.total_events > 0 && analytics);

  useEffect(() => {
    // Initialize Firebase on component mount
    import("utils/auth").then(() => {
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
        <p>Welcome to your YouTube analytics dashboard!</p>

        {/* YouTube Sync Section */}
        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Data Synchronization</h2>
          <div className="mb-6">
            <YouTubeSyncButton />
          </div>
        </div>

        {/* Liked Videos Summary Analytics */}
        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Liked Videos Overview</h2>
          <LikedVideosStats className="mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              <ShortsVsRegularChart />
            </div>
            {/* Placeholder for future analytics component */}
            <div className="col-span-1">
              <CategoryDistribution className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Detailed Analytics Dashboard */}
        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Detailed Analytics</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 xl:col-span-3">
              <WatchTimeHeatMap className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 lg:col-span-1 xl:col-span-2">
              <VideoLengthDistribution className="w-full h-full" />
            </div>
            <div className="col-span-1">
              <WatchThroughPercentage className="w-full h-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              <TopChannels className="w-full h-full" limit={10} />
            </div>
            <div className="col-span-1">
              <CategoryDistribution className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Watch History Insights */}
        <div className="mt-12 mb-8 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Watch History Insights</h2>
          <WatchHistoryUploadCard />
          <WatchHistoryHighlights />
          {hasWatchHistory && (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SessionDurationChart className="w-full" />
                <RecommendationBreakdown className="w-full" />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ViewingHeatmap className="w-full" />
                <InAppNudges className="w-full" />
              </div>
              <RepeatWatchList />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
