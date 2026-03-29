import React, { useEffect } from "react";
import { Button } from "components/Button";
import { AuthSection } from "components/AuthSection";
import { AuthProvider } from "utils/AuthContext";
import useDataStore from "utils/dataStore";
import { firebaseApp } from "app";
import { getFirestore } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedPage } from "components/AnimatedPage";
import { SectionIntro } from "components/SectionIntro";
import { EditorialPanel } from "components/EditorialPanel";
import { HeatMapPreview } from "components/HeatMapPreview";
import { DonutChartPreview } from "components/DonutChartPreview";
import { TopChannelsPreview } from "components/TopChannelsPreview";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, scrollRevealProps } from "@/lib/motion";

export default function App() {
  const { initializeAuth, user } = useDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Firebase on component mount
    import("utils/auth").then(() => {
      console.log("Firebase authentication initialized");

      // Initialize Firestore and auth listeners
      getFirestore(firebaseApp);
      initializeAuth();
    });
  }, [initializeAuth]);

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <AuthProvider>
      <AnimatedPage className="min-h-screen bg-background text-foreground">
        {/* Skip to content */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Editorial masthead header */}
        <header className="sticky top-0 z-50 bg-background border-b border-rule">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-4">
            <Link to="/" className="flex items-center no-underline shrink-0">
              <img
                src="/logo.png"
                alt="MirrorYourself Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight">
                MirrorYourself
              </span>
            </Link>
            <AuthSection />
          </div>
        </header>

        <main id="main-content">
          {/* ─── Editorial Hero / Cover Opener ─── */}
          <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6"
              >
                <motion.div variants={staggerItem} className="section-eyebrow">
                  <span>A Private Edition</span>
                </motion.div>

                <motion.h1
                  variants={staggerItem}
                  className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08]"
                >
                  Your viewing habits,{" "}
                  <span className="text-signal font-finding italic">read back to you</span>
                </motion.h1>

                <motion.p
                  variants={staggerItem}
                  className="text-lg sm:text-xl text-ink-soft max-w-2xl leading-relaxed"
                >
                  MirrorYourself turns your YouTube data into a personal report
                  — patterns, rhythms, taste, and time — assembled like a
                  feature story only you can read.
                </motion.p>

                <motion.div
                  variants={staggerItem}
                  className="flex flex-col sm:flex-row gap-4 mt-4"
                >
                  <Button asChild variant="default" size="lg">
                    <Link to="/login">Read Your Edition</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#editorial-spreads">See What We Reveal</a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Subtle editorial gradient atmosphere */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 20%, hsl(var(--signal-soft)) 0%, transparent 70%)",
                opacity: 0.5,
              }}
            />
          </section>

          <div className="divider-rule container mx-auto" />

          {/* ─── Editorial Spreads ─── */}
          <div id="editorial-spreads">
            {/* Section 1: Your Rhythm — HeatMap dominant */}
            <section className="py-16 sm:py-20 lg:py-24 scroll-mt-24">
              <div className="container mx-auto px-4">
                <motion.div
                  {...scrollRevealProps}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                  {/* Text — left */}
                  <div className="flex flex-col gap-6">
                    <SectionIntro
                      eyebrow="Rhythm"
                      title="When you watch says as much as what you watch"
                      deck="Your daily viewing patterns form a heat signature — weekday
                      routines, late-night sessions, weekend marathons. The heatmap
                      reads your schedule back to you in a way no playlist ever could."
                      className="sm:flex-col sm:items-start"
                    />
                  </div>

                  {/* Visual — right */}
                  <EditorialPanel tone="primary" className="overflow-hidden">
                    <HeatMapPreview />
                    <p className="chart-caption mt-4 text-sm text-ink-soft">
                      Sample heatmap — your edition reveals your real viewing rhythm.
                    </p>
                  </EditorialPanel>
                </motion.div>
              </div>
            </section>

            <div className="divider-rule container mx-auto" />

            {/* Section 2: Your Taste — DonutChart dominant (reversed layout) */}
            <section className="py-16 sm:py-20 lg:py-24">
              <div className="container mx-auto px-4">
                <motion.div
                  {...scrollRevealProps}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                  {/* Visual — left on desktop */}
                  <EditorialPanel tone="secondary" className="overflow-hidden lg:order-first order-last">
                    <DonutChartPreview />
                    <p className="chart-caption mt-4 text-sm text-ink-soft">
                      Sample distribution — your content DNA, decoded.
                    </p>
                  </EditorialPanel>

                  {/* Text — right */}
                  <div className="flex flex-col gap-6">
                    <SectionIntro
                      eyebrow="Taste"
                      title="Your content DNA, broken down by category"
                      deck="Gaming, music, cooking, tech — your liked videos and watch
                      history reveal a fingerprint of taste. See which categories pull
                      you in and how your interests shift over time."
                      className="sm:flex-col sm:items-start"
                    />
                  </div>
                </motion.div>
              </div>
            </section>

            <div className="divider-rule container mx-auto" />

            {/* Section 3: Your Creators — TopChannels dominant */}
            <section className="py-16 sm:py-20 lg:py-24">
              <div className="container mx-auto px-4">
                <motion.div
                  {...scrollRevealProps}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                  {/* Text — left */}
                  <div className="flex flex-col gap-6">
                    <SectionIntro
                      eyebrow="Creators"
                      title="The channels you keep coming back to"
                      deck="Loyalty patterns emerge when you look at the data. Which
                      creators earn your repeat attention? Which ones quietly dominate
                      your watch time? Your report names them."
                      className="sm:flex-col sm:items-start"
                    />
                  </div>

                  {/* Visual — right */}
                  <EditorialPanel tone="secondary" className="overflow-hidden">
                    <TopChannelsPreview />
                    <p className="chart-caption mt-4 text-sm text-ink-soft">
                      Sample loyalty chart — your edition ranks your real creators.
                    </p>
                  </EditorialPanel>
                </motion.div>
              </div>
            </section>
          </div>

          <div className="divider-rule container mx-auto" />

          {/* ─── Privacy Section ─── */}
          <section className="py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4">
              <motion.div {...scrollRevealProps}>
                <EditorialPanel tone="quiet" className="max-w-3xl mx-auto text-center py-10 sm:py-12">
                  <SectionIntro
                    eyebrow="Privacy First"
                    title="Your data stays yours"
                    deck={
                      <span className="block max-w-xl mx-auto">
                        MirrorYourself processes your viewing data locally and never
                        shares it. No social features, no public profiles, no
                        tracking pixels. Your report is for your eyes only.
                      </span>
                    }
                    className="flex-col items-center text-center sm:flex-col sm:items-center"
                    titleClassName="text-center"
                    deckClassName="text-center"
                  />
                </EditorialPanel>
              </motion.div>
            </div>
          </section>

          <div className="divider-rule container mx-auto" />

          {/* ─── Closing CTA Section ─── */}
          <section className="py-20 sm:py-24 lg:py-28">
            <div className="container mx-auto px-4">
              <motion.div
                {...scrollRevealProps}
                className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto"
              >
                <div className="section-eyebrow">
                  <span>Your Edition Awaits</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  Your watch history has a story to tell
                </h2>
                <p className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-xl">
                  Sign in with Google, upload your Takeout data, and
                  MirrorYourself assembles your personal report in under a
                  minute.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Button asChild variant="default" size="lg">
                    <Link to="/login">Open Your Report</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ─── Editorial Footer ─── */}
        <footer className="py-8 border-t border-rule">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-ink-soft font-display tracking-tight">
                MirrorYourself
              </span>
              <div className="flex items-center gap-1 text-sm text-ink-soft">
                <Link
                  to="/privacy-policy"
                  className="hover:text-foreground transition-colors py-3 px-2"
                >
                  Privacy Policy
                </Link>
                <span className="text-ink-soft opacity-40" aria-hidden="true">&middot;</span>
                <Link
                  to="/terms-of-service"
                  className="hover:text-foreground transition-colors py-3 px-2"
                >
                  Terms of Service
                </Link>
                <span className="text-ink-soft opacity-40" aria-hidden="true">&middot;</span>
                <span className="py-3 px-2">
                  &copy; {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </AnimatedPage>
    </AuthProvider>
  );
}
