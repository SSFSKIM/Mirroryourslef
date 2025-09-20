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

  // Auto-load watch history data when user is authenticated
  useEffect(() => {
    if (user && (!status || !analytics)) {
      loadStatus();
      loadAnalytics();
    }
  }, [user, status, analytics, loadStatus, loadAnalytics]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="https://static.databutton.com/public/82a95cff-29ca-4147-8b0f-4bde6152bdae/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-07-15%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%2012.24.44.png" alt="Youtube Mirror Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">Youtube Mirror</h1>
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
