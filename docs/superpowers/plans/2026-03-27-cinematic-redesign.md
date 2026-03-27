# Cinematic Data Observatory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MirrorYourself from a generic dark dashboard into a cinematic data observatory with luminous data, glass panels, atmospheric depth, and orchestrated motion.

**Architecture:** Replace the CSS token system in index.css, add new shared primitives (GlassCard, Atmosphere, GrainOverlay, motion variants, StatCard), then redesign each page top-to-bottom. All data flows and API calls remain untouched — this is a pure visual layer change.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion 10.18 (already installed)

**Spec:** `docs/superpowers/specs/2026-03-27-design-system-design.md`

---

### Task 1: Rewrite index.css — Deep Field Token System

**Files:**
- Modify: `view-time (5)/frontend/src/index.css` (full rewrite)

This is the foundation. Every subsequent task depends on these tokens.

- [ ] **Step 1: Replace index.css with the Deep Field design system**

Replace the entire contents of `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 15% 97%;
    --foreground: 222 20% 12%;
    --card: 0 0% 100%;
    --card-foreground: 222 20% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 20% 12%;
    --primary: 172 70% 35%;
    --primary-foreground: 0 0% 100%;
    --secondary: 222 10% 92%;
    --secondary-foreground: 222 20% 12%;
    --muted: 222 10% 92%;
    --muted-foreground: 222 10% 45%;
    --accent: 38 85% 50%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --border: 220 15% 90%;
    --input: 220 15% 90%;
    --ring: 172 70% 35%;
    --radius: 0.75rem;

    --chart-1: 172 70% 35%;
    --chart-2: 38 85% 50%;
    --chart-3: 270 55% 55%;
    --chart-4: 340 65% 55%;
    --chart-5: 145 60% 42%;
    --chart-6: 200 75% 50%;
    --chart-7: 20 80% 50%;
    --chart-8: 295 60% 52%;
    --chart-accent: 172 70% 35%;
    --chart-muted: 220 14% 90%;

    --glow-primary: 172 70% 35%;
    --glow-accent: 38 85% 50%;
  }

  .dark {
    --background: 222 25% 3.5%;
    --foreground: 210 20% 95%;
    --card: 222 20% 7%;
    --card-foreground: 210 20% 95%;
    --popover: 222 20% 7%;
    --popover-foreground: 210 20% 95%;
    --primary: 172 80% 55%;
    --primary-foreground: 222 25% 3.5%;
    --secondary: 222 15% 13%;
    --secondary-foreground: 210 20% 90%;
    --muted: 222 15% 13%;
    --muted-foreground: 222 15% 50%;
    --accent: 38 90% 60%;
    --accent-foreground: 222 25% 3.5%;
    --destructive: 0 70% 55%;
    --destructive-foreground: 0 0% 98%;
    --border: 222 15% 12%;
    --input: 222 15% 12%;
    --ring: 172 80% 55%;
    --radius: 0.75rem;

    --chart-1: 172 80% 55%;
    --chart-2: 38 90% 60%;
    --chart-3: 270 60% 65%;
    --chart-4: 340 70% 60%;
    --chart-5: 145 65% 50%;
    --chart-6: 200 80% 60%;
    --chart-7: 20 85% 58%;
    --chart-8: 295 65% 60%;
    --chart-accent: 172 80% 55%;
    --chart-muted: 222 15% 15%;

    --glow-primary: 172 80% 55%;
    --glow-accent: 38 90% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, .font-display {
    font-family: 'Syne', ui-sans-serif, system-ui, sans-serif;
  }

  .font-mono,
  .font-data,
  [data-slot="stat"],
  .tabular-nums,
  code {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }

  :focus-visible {
    @apply outline-2 outline-offset-2 outline-ring;
  }

  .skip-to-content {
    @apply sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
      focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground
      focus:shadow-lg;
  }
}

/* ── Glass card ── */
@layer components {
  .glass-card {
    @apply rounded-[var(--radius)] border;
    background: hsl(var(--card) / 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-color: hsl(var(--border) / 0.5);
    transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
  }

  .glass-card:hover {
    border-color: hsl(var(--primary) / 0.2);
    box-shadow: 0 0 20px hsl(var(--glow-primary) / 0.08);
  }
}

/* ── Glow utilities ── */
@layer utilities {
  .glow-primary-sm { box-shadow: 0 0 8px hsl(var(--glow-primary) / 0.1); }
  .glow-primary    { box-shadow: 0 0 20px hsl(var(--glow-primary) / 0.15); }
  .glow-primary-lg { box-shadow: 0 0 40px hsl(var(--glow-primary) / 0.12); }
  .glow-accent-sm  { box-shadow: 0 0 8px hsl(var(--glow-accent) / 0.1); }
  .glow-accent     { box-shadow: 0 0 20px hsl(var(--glow-accent) / 0.15); }
  .glow-accent-lg  { box-shadow: 0 0 40px hsl(var(--glow-accent) / 0.12); }
}

/* ── Grain texture overlay ── */
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ── Atmosphere orbs ── */
.atmosphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.atmosphere-primary {
  background: hsl(var(--glow-primary) / 0.07);
}

.atmosphere-accent {
  background: hsl(var(--glow-accent) / 0.05);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

- [ ] **Step 2: Verify build still compiles**

Run: `cd "view-time (5)/frontend" && yarn tsc --noEmit 2>&1 | grep -c "index.css"` — expect 0

- [ ] **Step 3: Commit**

```bash
git add "view-time (5)/frontend/src/index.css"
git commit -m "feat: replace token system with Deep Field cinematic design tokens"
```

---

### Task 2: Create Motion Variants + Shared Primitives

**Files:**
- Create: `view-time (5)/frontend/src/lib/motion.ts`
- Create: `view-time (5)/frontend/src/components/GrainOverlay.tsx`
- Create: `view-time (5)/frontend/src/components/Atmosphere.tsx`
- Create: `view-time (5)/frontend/src/components/GlassCard.tsx`
- Create: `view-time (5)/frontend/src/components/StatCard.tsx`
- Create: `view-time (5)/frontend/src/components/AnimatedPage.tsx`

- [ ] **Step 1: Create `src/lib/motion.ts`**

```typescript
import { type Variants } from "framer-motion";

/** Page enter/exit transition */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/** Container that staggers its children */
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

/** Individual staggered item (card, stat, etc.) */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

/** Stat number materializing */
export const dataMaterialize: Variants = {
  initial: { opacity: 0, scale: 0.85, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Scroll-triggered reveal for below-fold sections */
export const scrollRevealProps = {
  initial: { opacity: 0, y: 40 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

/** Card hover lift effect */
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
};

/** Reduced motion: override all transitions to instant */
export const reducedMotionTransition = { duration: 0 };
```

- [ ] **Step 2: Create `src/components/GrainOverlay.tsx`**

```tsx
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
```

- [ ] **Step 3: Create `src/components/Atmosphere.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface AtmosphereProps {
  variant?: "primary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-[300px] h-[200px]",
  md: "w-[500px] h-[400px]",
  lg: "w-[700px] h-[500px]",
};

export function Atmosphere({ variant = "primary", size = "md", className }: AtmosphereProps) {
  return (
    <div
      className={cn(
        "atmosphere",
        variant === "primary" ? "atmosphere-primary" : "atmosphere-accent",
        sizes[size],
        className,
      )}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 4: Create `src/components/GlassCard.tsx`**

```tsx
import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem, hoverLift } from "@/lib/motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  stagger?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, stagger = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("glass-card p-6", className)}
        variants={stagger ? staggerItem : undefined}
        {...(hover ? hoverLift : {})}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
```

- [ ] **Step 5: Create `src/components/StatCard.tsx`**

```tsx
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { dataMaterialize, staggerItem } from "@/lib/motion";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, className }: StatCardProps) {
  return (
    <GlassCard stagger className={className}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-primary/60" aria-hidden="true" />}
      </div>
      <motion.div variants={dataMaterialize}>
        <p className="font-data text-3xl font-bold tracking-tight glow-primary-sm" data-slot="stat">
          {value}
        </p>
      </motion.div>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 6: Create `src/components/AnimatedPage.tsx`**

```tsx
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/motion";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add "view-time (5)/frontend/src/lib/motion.ts" \
  "view-time (5)/frontend/src/components/GrainOverlay.tsx" \
  "view-time (5)/frontend/src/components/Atmosphere.tsx" \
  "view-time (5)/frontend/src/components/GlassCard.tsx" \
  "view-time (5)/frontend/src/components/StatCard.tsx" \
  "view-time (5)/frontend/src/components/AnimatedPage.tsx"
git commit -m "feat: add cinematic shared primitives — motion, glass cards, atmosphere, grain"
```

---

### Task 3: Update Base shadcn Components

**Files:**
- Modify: `view-time (5)/frontend/src/components/Button.tsx`
- Modify: `view-time (5)/frontend/src/components/ChartTooltip.tsx`
- Modify: `view-time (5)/frontend/src/components/LoadingSpinner.tsx`

- [ ] **Step 1: Update Button.tsx — add glow variant, replace accent**

In `src/components/Button.tsx`, replace the `variant` object inside `buttonVariants`:

```typescript
variant: {
  default:
    "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:glow-primary-sm",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline:
    "border border-input bg-transparent shadow-sm hover:bg-accent/10 hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent/10 hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  accent:
    "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:glow-accent-sm",
  glow:
    "bg-primary text-primary-foreground shadow glow-primary hover:glow-primary-lg transition-shadow",
},
```

- [ ] **Step 2: Update ChartTooltip.tsx — glass panel styling**

Replace `chartTooltipStyle` in `src/components/ChartTooltip.tsx`:

```typescript
export const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card) / 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid hsl(var(--border) / 0.5)",
  borderRadius: "8px",
  color: "hsl(var(--card-foreground))",
  fontSize: "12px",
  boxShadow: "0 0 20px hsl(var(--glow-primary) / 0.08)",
};
```

- [ ] **Step 3: Update LoadingSpinner.tsx — cyan themed**

Replace the `Loader2` className in `src/components/LoadingSpinner.tsx`:

Change: `"animate-spin text-primary"` (already correct with new primary=cyan)

No code change needed — the primary token is now cyan, so the spinner automatically inherits it.

- [ ] **Step 4: Commit**

```bash
git add "view-time (5)/frontend/src/components/Button.tsx" \
  "view-time (5)/frontend/src/components/ChartTooltip.tsx"
git commit -m "feat: update base components with cinematic glow variants"
```

---

### Task 4: Add GrainOverlay + Page Transitions to App Shell

**Files:**
- Modify: `view-time (5)/frontend/src/components/AppProvider.tsx`
- Modify: `view-time (5)/frontend/src/router.tsx`

- [ ] **Step 1: Add GrainOverlay to AppProvider**

Replace `src/components/AppProvider.tsx`:

```tsx
import { Toaster } from "@/components/ui/sonner";
import FirestoreInitializer from "./FirestoreInitializer";
import { GrainOverlay } from "./GrainOverlay";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FirestoreInitializer>
      {children}
      <GrainOverlay />
      <Toaster position="top-right" richColors />
    </FirestoreInitializer>
  );
};
```

- [ ] **Step 2: Add AnimatePresence to router for page transitions**

Replace `src/router.tsx`:

```tsx
import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { userRoutes } from "./user-routes";
import { AppProvider } from "components/AppProvider";

const SuspenseFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" role="status">
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
};

const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.pathname} />
    </AnimatePresence>
  );
};

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SomethingWentWrongPage = lazy(
  () => import("./pages/SomethingWentWrongPage"),
);

export const router = createBrowserRouter(
  [
    {
      element: (
        <AppProvider>
          <SuspenseWrapper>
            <AnimatedOutlet />
          </SuspenseWrapper>
        </AppProvider>
      ),
      children: userRoutes
    },
    {
      path: "*",
      element: (
        <SuspenseWrapper>
          <NotFoundPage />
        </SuspenseWrapper>
      ),
      errorElement: (
        <SuspenseWrapper>
          <SomethingWentWrongPage />
        </SuspenseWrapper>
      ),
    },
  ]
);
```

- [ ] **Step 3: Commit**

```bash
git add "view-time (5)/frontend/src/components/AppProvider.tsx" \
  "view-time (5)/frontend/src/router.tsx"
git commit -m "feat: add grain overlay and page transition shell"
```

---

### Task 5: Redesign Landing Page (App.tsx)

**Files:**
- Modify: `view-time (5)/frontend/src/pages/App.tsx` (full rewrite of JSX)

This is the biggest single task. The landing page gets the full cinematic treatment: atmospheric hero, staggered reveals, glass feature cards, glowing CTA.

- [ ] **Step 1: Rewrite App.tsx with cinematic landing**

Full rewrite of `src/pages/App.tsx`. Preserve the existing imports for `useDataStore`, `firebaseApp`, `getFirestore`, `useNavigate`, and the `useEffect` hooks. Replace all JSX with the cinematic layout.

Key sections:
1. **Hero** — full viewport, Syne display heading with staggered word reveal, atmospheric gradient orbs behind, two CTAs (glow primary + ghost)
2. **Features** — 3 glass cards staggering in on scroll, icon + Syne heading + Outfit body
3. **CTA** — centered glass panel with atmospheric gradient, glowing button
4. **Footer** — minimal, muted

Use `AnimatedPage` wrapper, `motion.div` with `staggerContainer`/`staggerItem` for card grids, `scrollRevealProps` for below-fold sections, `Atmosphere` orbs positioned absolutely behind hero and CTA sections.

The heading should use: `className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"`

Feature cards should use `<GlassCard stagger>` inside a `<motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>`.

Primary CTA: `<Button variant="glow" size="lg">Get Started</Button>`
Secondary CTA: `<Button variant="ghost" size="lg">Learn More</Button>`

- [ ] **Step 2: Verify page renders**

Run dev server and check http://localhost:5173 renders without errors.

- [ ] **Step 3: Commit**

```bash
git add "view-time (5)/frontend/src/pages/App.tsx"
git commit -m "feat: redesign landing page with cinematic hero and glass cards"
```

---

### Task 6: Redesign Login Page

**Files:**
- Modify: `view-time (5)/frontend/src/pages/Login.tsx` (full rewrite of JSX)

- [ ] **Step 1: Rewrite Login.tsx**

Centered glass card floating over atmospheric background. Single `Atmosphere` orb behind the card. Logo with glow. "Welcome back" in Syne 700. Google auth button using accent color. Privacy links in muted text below.

Use `AnimatedPage` wrapper. The glass card uses `<GlassCard hover={false} className="w-full max-w-md p-8">`.

- [ ] **Step 2: Commit**

```bash
git add "view-time (5)/frontend/src/pages/Login.tsx"
git commit -m "feat: redesign login with glass panel and atmospheric background"
```

---

### Task 7: Redesign Dashboard Structure — Header, Tabs, Layout

**Files:**
- Modify: `view-time (5)/frontend/src/pages/Dashboard.tsx` (rewrite layout structure)

- [ ] **Step 1: Rewrite Dashboard.tsx layout**

Key changes:
1. **Header**: Glass-effect sticky navbar with `glass-card` styling and bottom glow border
2. **Page title**: Syne font-display with welcome message
3. **Tab system**: Style the TabsList with transparent bg, TabsTrigger with `data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary` instead of the bg-based active state
4. **Content wrapper**: `<AnimatedPage>` wrapper, `<motion.div variants={staggerContainer}>` around card grids
5. **Atmospheric gradients**: One `<Atmosphere variant="primary" size="lg">` positioned behind the stat row area

All chart cards get wrapped in `<GlassCard stagger>` instead of plain `<Card>`. Stat rows use `<StatCard>`.

The dashboard grid should use `motion.div` with `staggerContainer` and `initial="initial" animate="animate"` so cards stagger in when tab content appears.

- [ ] **Step 2: Verify dashboard renders with existing data stores**

Run dev server, sign in, check dashboard renders with both tabs.

- [ ] **Step 3: Commit**

```bash
git add "view-time (5)/frontend/src/pages/Dashboard.tsx"
git commit -m "feat: redesign dashboard with glass panels, animated tabs, staggered reveals"
```

---

### Task 8: Update Liked Videos Tab Components

**Files:**
- Modify: `view-time (5)/frontend/src/components/LikedVideosStats.tsx` — use StatCard
- Modify: `view-time (5)/frontend/src/components/YouTubeSyncButton.tsx` — glass card, accent CTA
- Modify: `view-time (5)/frontend/src/components/CategoryDistribution.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/TopChannels.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/TopKeywords.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/VideoLengthDistribution.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/ShortsCircularProgress.tsx` — glass, glow on progress ring

- [ ] **Step 1: Update LikedVideosStats.tsx to use StatCard**

Replace the loading skeleton `Card` elements with skeleton `GlassCard` elements. Replace each stat `Card` with `<StatCard label="..." value={...} subtitle="..." icon={...} />`. Import `StatCard` and remove the manual card markup.

- [ ] **Step 2: Update YouTubeSyncButton.tsx**

Replace the outer `Card` usage with `GlassCard`. The sync button should use `<Button variant="accent">` for the YouTube red/amber CTA. Keep all existing logic untouched.

- [ ] **Step 3: Update all chart components — wrap in GlassCard**

For each chart component (CategoryDistribution, ShortsVsRegularChart, MonthlyTrendsChart, TopChannels, TopKeywords, ChannelLoyaltyInsight, VideoLengthDistribution, LikesTimeHeatmap, ShortsCircularProgress):

Replace `<Card className={className}>` with `<GlassCard className={className} hover>`. Update the CardHeader/CardContent to sit inside the GlassCard — since GlassCard already provides padding, adjust inner padding as needed.

For charts using `CartesianGrid`, set `stroke="hsl(var(--chart-muted))"` for subtle grid lines.

For ShortsCircularProgress, the conic-gradient already uses `--chart-accent` (now cyan). The glow will come from the `GlassCard` hover state.

- [ ] **Step 4: Commit**

```bash
git add "view-time (5)/frontend/src/components/LikedVideosStats.tsx" \
  "view-time (5)/frontend/src/components/YouTubeSyncButton.tsx" \
  "view-time (5)/frontend/src/components/CategoryDistribution.tsx" \
  "view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx" \
  "view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx" \
  "view-time (5)/frontend/src/components/TopChannels.tsx" \
  "view-time (5)/frontend/src/components/TopKeywords.tsx" \
  "view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx" \
  "view-time (5)/frontend/src/components/VideoLengthDistribution.tsx" \
  "view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx" \
  "view-time (5)/frontend/src/components/ShortsCircularProgress.tsx"
git commit -m "feat: apply cinematic glass treatment to all liked-videos components"
```

---

### Task 9: Update Watch History Tab Components

**Files:**
- Modify: `view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx` — glass, cyan drag-drop glow
- Modify: `view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx` — use StatCard
- Modify: `view-time (5)/frontend/src/components/ViewingHeatmap.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/RepeatWatchList.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/InAppNudges.tsx` — glass card with accent icon
- Modify: `view-time (5)/frontend/src/components/RecommendationBreakdown.tsx` — glass wrapper
- Modify: `view-time (5)/frontend/src/components/SessionDurationChart.tsx` — glass wrapper

- [ ] **Step 1: Update WatchHistoryUploadCard.tsx**

Replace outer card with `GlassCard`. The drag-drop zone should glow cyan on dragover: change the border/scale treatment to add `glow-primary-sm` class when dragging. Keep all upload logic untouched.

- [ ] **Step 2: Update WatchHistoryHighlights.tsx — use StatCard**

Replace each stat `Card` with `<StatCard>`. Import `StatCard`, `Clock`, `Sparkles`, `Flame`, `SplitSquareHorizontal` icons. Map each existing stat to a `<StatCard label="..." value={...} subtitle="..." icon={...} />`.

- [ ] **Step 3: Update remaining watch history chart components**

Same pattern as Task 8 Step 3: replace `<Card>` with `<GlassCard>` in ViewingHeatmap, RepeatWatchList, InAppNudges, RecommendationBreakdown, SessionDurationChart.

For InAppNudges, use accent-colored icon with `text-accent` class.

- [ ] **Step 4: Commit**

```bash
git add "view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx" \
  "view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx" \
  "view-time (5)/frontend/src/components/ViewingHeatmap.tsx" \
  "view-time (5)/frontend/src/components/RepeatWatchList.tsx" \
  "view-time (5)/frontend/src/components/InAppNudges.tsx" \
  "view-time (5)/frontend/src/components/RecommendationBreakdown.tsx" \
  "view-time (5)/frontend/src/components/SessionDurationChart.tsx"
git commit -m "feat: apply cinematic glass treatment to all watch-history components"
```

---

### Task 10: Redesign Logout + Final Polish

**Files:**
- Modify: `view-time (5)/frontend/src/pages/Logout.tsx`
- Modify: `view-time (5)/frontend/src/components/UserProfile.tsx`
- Modify: `view-time (5)/frontend/src/components/GoogleAuthButton.tsx`

- [ ] **Step 1: Update Logout.tsx with cinematic loading**

Replace the simple spinner with an `AnimatedPage`-wrapped cinematic logout: atmospheric background, centered glass card with "Signing out..." message and cyan spinner.

- [ ] **Step 2: Update UserProfile.tsx**

Add glass-card styling to the profile display. Avatar should have a subtle primary glow ring.

- [ ] **Step 3: Update GoogleAuthButton.tsx**

The Google button should use the accent (amber) color scheme with `hover:glow-accent-sm` for warmth.

- [ ] **Step 4: Final visual consistency pass**

Check all components use the consistent patterns:
- `font-display` on all h1/h2 elements
- `font-data` / `data-slot="stat"` on all stat numbers
- `text-primary` for data highlights (cyan)
- `text-accent` for CTAs and warm highlights (amber)
- `text-muted-foreground` for secondary text
- `glass-card` on all card surfaces
- No remaining hardcoded colors (search for `#` and `rgb(` in component files)

- [ ] **Step 5: Commit**

```bash
git add "view-time (5)/frontend/src/pages/Logout.tsx" \
  "view-time (5)/frontend/src/components/UserProfile.tsx" \
  "view-time (5)/frontend/src/components/GoogleAuthButton.tsx"
git commit -m "feat: complete cinematic redesign — logout, profile, auth button, final polish"
```

---

### Task 11: Verify Everything Works

- [ ] **Step 1: Run TypeScript type check**

```bash
cd "view-time (5)/frontend" && yarn tsc --noEmit
```

Filter for new errors only (pre-existing errors in DevTools.tsx and dataStore.ts are known).

- [ ] **Step 2: Run lint**

```bash
cd "view-time (5)/frontend" && yarn lint
```

- [ ] **Step 3: Manual QA checklist**

1. Landing page: hero animation plays, features stagger in on scroll, CTA glows
2. Login: glass card renders over atmospheric background, Google button works
3. Dashboard: tabs switch with animation, stat cards stagger in, charts render in glass cards
4. Watch History tab: upload card glows on drag, all charts render
5. Mobile (375px): everything stacks properly, no horizontal scroll
6. Reduced motion: disable animations in OS settings, verify no animations play
7. Dark mode is default, light mode works if toggled

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass for cinematic redesign"
```
