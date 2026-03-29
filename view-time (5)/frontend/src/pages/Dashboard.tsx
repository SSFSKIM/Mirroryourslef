import { useEffect } from "react";
import { useAuthStore } from "utils/auth";
import { UserProfile } from "components/UserProfile";
import { DashboardMasthead } from "components/DashboardMasthead";
import { SectionIntro } from "components/SectionIntro";
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
import { Link } from "react-router-dom";
import { AnimatedPage } from "components/AnimatedPage";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

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
    <AnimatedPage>
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <header className="sticky top-0 z-10 border-b border-rule bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center no-underline">
            <img src="/logo.png" alt="MirrorYourself Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-display font-bold text-foreground">MirrorYourself</span>
          </Link>
          <UserProfile />
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8">
        <DashboardMasthead>
          <UserProfile className="sm:hidden" />
        </DashboardMasthead>

        <Tabs defaultValue="liked-videos" className="w-full">
          <TabsList className="w-full max-w-md bg-transparent rounded-none border-b border-rule p-0 h-auto mb-8">
            <TabsTrigger
              value="liked-videos"
              className="rounded-none px-4 py-3 text-sm sm:text-base font-display font-medium text-ink-soft hover:text-foreground data-[state=active]:text-signal data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-signal transition-colors"
            >
              Taste Profile
            </TabsTrigger>
            <TabsTrigger
              value="watch-history"
              className="rounded-none px-4 py-3 text-sm sm:text-base font-display font-medium text-ink-soft hover:text-foreground data-[state=active]:text-signal data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-signal transition-colors"
            >
              Behavior Report
            </TabsTrigger>
          </TabsList>

          {/* Liked Videos Tab */}
          <TabsContent value="liked-videos" className="space-y-8">
            {/* YouTube Sync Section */}
            <section>
              <SectionIntro eyebrow="Signals" title="Sync Your Likes" />
              <div className="mt-4">
                <YouTubeSyncButton />
              </div>
            </section>

            <hr className="divider-rule my-8" />

            {/* Liked Videos Overview */}
            <section>
              <SectionIntro eyebrow="Patterns" title="At a Glance" />
              <div className="mt-4">
                <LikedVideosStats className="mb-6" />

                <motion.div variants={staggerContainer} initial="initial" animate="animate">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ShortsVsRegularChart />
                    <CategoryDistribution className="w-full h-full" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChannelLoyaltyInsight className="w-full h-full" />
                  </div>
                </motion.div>
              </div>
            </section>

            <hr className="divider-rule my-8" />

            {/* Detailed Analytics */}
            <section>
              <SectionIntro eyebrow="Deep Read" title="The Full Picture" />
              <div className="mt-4">
                <motion.div variants={staggerContainer} initial="initial" animate="animate">
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
                </motion.div>
              </div>
            </section>
          </TabsContent>

          {/* Watch History Tab */}
          <TabsContent value="watch-history" className="space-y-8">
            {/* Upload Section */}
            <section>
              <SectionIntro eyebrow="Archive" title="Import Your History" />
              <div className="mt-4">
                <WatchHistoryUploadCard />
              </div>
            </section>

            <hr className="divider-rule my-8" />

            {/* Highlights */}
            <section>
              <SectionIntro eyebrow="Highlights" title="Your Viewing Profile" />
              <div className="mt-4">
                <WatchHistoryHighlights />
              </div>
            </section>

            {/* Detailed Insights */}
            {hasWatchHistory && (
              <>
                <hr className="divider-rule my-8" />

                <section>
                  <SectionIntro eyebrow="Deep Read" title="Behavior Analysis" />
                  <div className="mt-4">
                    <motion.div variants={staggerContainer} initial="initial" animate="animate">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                        <SessionDurationChart className="w-full" />
                        <RecommendationBreakdown className="w-full" />
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                        <ViewingHeatmap className="w-full" />
                        <InAppNudges className="w-full" />
                      </div>

                      <RepeatWatchList />
                    </motion.div>
                  </div>
                </section>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </AnimatedPage>
  );
}
