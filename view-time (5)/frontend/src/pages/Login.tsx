import { SignInOrUpForm } from "app/auth";
import { Link } from "react-router-dom";
import { AnimatedPage } from "components/AnimatedPage";
import { EditorialPanel } from "components/EditorialPanel";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

const discoveries = [
  { label: "Rhythm", description: "When you watch, and how sessions ebb and flow" },
  { label: "Taste", description: "The genres, creators, and themes you gravitate toward" },
  { label: "Sessions", description: "How long you stay, and what pulls you back" },
  { label: "Patterns", description: "The quiet habits hiding in your history" },
];

export default function Login() {
  return (
    <AnimatedPage className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Editorial masthead */}
      <header className="border-b border-rule bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center no-underline">
            <img
              src="/logo.png"
              alt="MirrorYourself Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-xl font-display font-bold text-foreground">
              MirrorYourself
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content — two-region editorial composition */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-20 gap-10">

            {/* Left region — editorial framing */}
            <motion.div
              className="lg:w-[57%] space-y-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div className="space-y-5" variants={staggerItem}>
                <div className="section-eyebrow">
                  <span>Your Personal Edition</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] tracking-[-0.04em] text-foreground">
                  Your viewing habits, decoded
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-ink-soft max-w-lg">
                  MirrorYourself reads your YouTube history the way an editor reads
                  a manuscript — finding the story in the data, and reflecting it
                  back to you with clarity.
                </p>
              </motion.div>

              {/* What you'll discover */}
              <motion.div className="space-y-4" variants={staggerItem}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  What you'll discover
                </h2>
                <ul className="space-y-3">
                  {discoveries.map((item) => (
                    <li key={item.label} className="flex items-baseline gap-3">
                      <span className="font-finding text-lg text-signal leading-none">
                        {item.label}
                      </span>
                      <span className="text-sm text-ink-soft leading-snug">
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Privacy reassurance */}
              <motion.p
                className="text-sm text-ink-soft leading-relaxed border-l-2 border-rule pl-4"
                variants={staggerItem}
              >
                No tracking. No sharing. Just your data, read back to you.
              </motion.p>
            </motion.div>

            {/* Right region — sign-in surface */}
            <motion.div
              className="lg:w-[43%] w-full max-w-md lg:max-w-none mx-auto lg:mx-0"
              variants={staggerItem}
              initial="initial"
              animate="animate"
            >
              <EditorialPanel tone="secondary" className="p-8 sm:p-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Sign in to read your edition
                    </h2>
                    <p className="text-sm text-ink-soft">
                      Connect your Google account to get started.
                    </p>
                  </div>

                  <SignInOrUpForm signInOptions={{ google: true }} />

                  <p className="text-xs text-ink-soft text-center pt-2">
                    By signing in, you agree to our{" "}
                    <Link
                      to="/terms-of-service"
                      className="text-signal hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-signal hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </EditorialPanel>
            </motion.div>

          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 border-t border-rule">
        <div className="container mx-auto px-4 text-center text-xs text-ink-soft">
          &copy; {new Date().getFullYear()} MirrorYourself. All rights reserved.
        </div>
      </footer>
    </AnimatedPage>
  );
}
