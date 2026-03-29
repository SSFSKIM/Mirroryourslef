import React, { useEffect } from "react";
import { Button } from "components/Button";
import { AuthSection } from "components/AuthSection";
import { AuthProvider } from "utils/AuthContext";
import useDataStore from "utils/dataStore";
import { firebaseApp } from "app";
import { getFirestore } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedPage } from "components/AnimatedPage";
import { GlassCard } from "components/GlassCard";
import { Atmosphere } from "components/Atmosphere";
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

        {/* Sticky glass header */}
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-4">
            <Link to="/" className="flex items-center no-underline shrink-0">
              <img
                src="/logo.png"
                alt="MirrorYourself Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-lg sm:text-xl font-bold font-display">
                MirrorYourself
              </span>
            </Link>
            <AuthSection />
          </div>
        </header>

        <main id="main-content">
          {/* ─── Hero Section ─── */}
          <section className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
            {/* Atmospheric orbs */}
            <Atmosphere
              variant="primary"
              size="lg"
              className="absolute -top-32 -left-40"
            />
            <Atmosphere
              variant="accent"
              size="md"
              className="absolute -bottom-24 -right-32"
            />

            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6"
              >
                <motion.h1
                  variants={staggerItem}
                  className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
                >
                  See your YouTube habits{" "}
                  <span className="text-primary">in a new light</span>
                </motion.h1>

                <motion.p
                  variants={staggerItem}
                  className="text-lg sm:text-xl text-muted-foreground max-w-2xl"
                >
                  MirrorYourself reveals the patterns hidden in your viewing
                  data — watch-time heatmaps, content DNA, session depth, and
                  more.
                </motion.p>

                <motion.div
                  variants={staggerItem}
                  className="flex flex-col sm:flex-row gap-4 mt-2"
                >
                  <Button asChild variant="default" size="lg">
                    <Link to="/login">Get Started</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <a href="#features">Learn More</a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ─── Features Section ─── */}
          <section id="features" className="py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
              <motion.div {...scrollRevealProps} className="mb-16 max-w-2xl">
                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  What you'll discover
                </h2>
                <p className="text-muted-foreground">
                  Your viewing data, decoded and illuminated.
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Primary feature — spans full width on mobile, left column on desktop */}
                <GlassCard stagger hover className="flex flex-col gap-4 md:row-span-2">
                  <span className="text-xs font-mono text-primary tracking-widest uppercase">
                    Viewing Patterns
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">
                    Heatmaps that reveal your daily rhythms
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When do you watch? How often? What routines are hiding in
                    plain sight? Your viewing patterns, laid out as a heat
                    signature only you can decode.
                  </p>
                </GlassCard>

                {/* Secondary features — right column, stacked */}
                <GlassCard stagger hover className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-primary tracking-widest uppercase">
                    Content DNA
                  </span>
                  <h3 className="font-display text-xl font-semibold">
                    Categories, creators, and topics that define you
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your unique viewing fingerprint — which creators you orbit,
                    which genres pull you in, and how your taste evolves.
                  </p>
                </GlassCard>

                <GlassCard stagger hover className="flex flex-col gap-3">
                  <span className="text-xs font-mono text-primary tracking-widest uppercase">
                    Session Insights
                  </span>
                  <h3 className="font-display text-xl font-semibold">
                    From casual scroll to deep dive
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    How long and how deep you go. Casual browsing vs marathon
                    sessions, measured and mapped.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* ─── CTA Section ─── */}
          <section className="py-24">
            <div className="container mx-auto px-4 relative">
              <Atmosphere
                variant="primary"
                size="md"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />

              <motion.div
                {...scrollRevealProps}
                className="relative z-10 flex flex-col items-start gap-6 max-w-xl"
              >
                <h2 className="font-display text-3xl sm:text-4xl font-bold">
                  Your watch history is waiting
                </h2>
                <p className="text-muted-foreground">
                  Sign in with Google, upload your Takeout data, and
                  MirrorYourself turns it into insights in under a minute.
                </p>
                <Button asChild variant="default" size="lg">
                  <Link to="/login">Sign in and start</Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ─── Footer ─── */}
        <footer className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground font-display">
                MirrorYourself
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  to="/privacy-policy"
                  className="hover:text-foreground transition-colors py-3 px-2"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="hover:text-foreground transition-colors py-3 px-2"
                >
                  Terms of Service
                </Link>
                <span className="py-3 px-2">
                  &copy; {new Date().getFullYear()} MirrorYourself
                </span>
              </div>
            </div>
          </div>
        </footer>
      </AnimatedPage>
    </AuthProvider>
  );
}
