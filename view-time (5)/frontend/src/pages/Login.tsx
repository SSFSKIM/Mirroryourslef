import { SignInOrUpForm } from "app/auth";
import { Link } from "react-router-dom";
import { AnimatedPage } from "components/AnimatedPage";
import { GlassCard } from "components/GlassCard";
import { Atmosphere } from "components/Atmosphere";

export default function Login() {
  return (
    <AnimatedPage className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Sticky glass header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
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

      {/* Main Content */}
      <main
        id="main-content"
        className="min-h-[calc(100vh-80px)] flex items-center justify-center relative px-4 py-12"
      >
        {/* Atmospheric background orb */}
        <Atmosphere
          variant="primary"
          size="lg"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />

        {/* Login card */}
        <GlassCard hover={false} className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              alt=""
              className="h-12 w-12 mb-4 opacity-80"
            />
            <h1 className="font-display text-3xl font-bold text-center mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-center text-sm max-w-xs">
              Sign in to see your viewing patterns, content DNA, and session
              insights.
            </p>
          </div>

          <SignInOrUpForm signInOptions={{ google: true }} />

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our{" "}
            <Link to="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </GlassCard>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MirrorYourself. All rights reserved.
        </div>
      </footer>
    </AnimatedPage>
  );
}
