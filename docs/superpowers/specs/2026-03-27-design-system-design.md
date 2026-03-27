# Cinematic Data Observatory — Design System & Full Redesign

## Overview

A complete visual redesign of MirrorYourself (ViewTime) applying a "Cinematic Data Observatory" aesthetic. The concept: your YouTube data rendered as if peering through a telescope into your own digital habits. Deep space-black backgrounds, data that emits light, atmospheric depth, and orchestrated motion.

**Scope:** Full redesign — Landing page, Login page, Dashboard (both tabs). New design system tokens, typography, effects, and motion patterns applied to all existing components.

**Key Differentiator:** Data as light source. Charts glow. Stats pulse. The background has atmospheric depth with radial gradients like distant nebulae behind analytics panels.

## Dependencies

### New packages

- `framer-motion` — orchestrated page transitions, staggered card reveals, spring-physics interactions, scroll-triggered animations (~35KB gzipped)

### Font changes

Replace current Fira Sans / Fira Code with:

- **Syne** (weights 700, 800) — display/heading font. Angular, futuristic, avant-garde.
- **Outfit** (weights 300, 400, 500, 600) — body/UI font. Geometric, clean, readable.
- **JetBrains Mono** (weights 400, 500, 700) — data/monospace font. Tabular figures for stats.

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap
```

## Color System — "Deep Field"

### Dark mode (primary experience)

```css
--background: 222 25% 3.5%;        /* Near-black, cool blue shift */
--foreground: 210 20% 95%;          /* Near-white */
--card: 222 20% 7%;                 /* Floating panel surface */
--card-foreground: 210 20% 95%;     /* Card text */
--popover: 222 20% 7%;
--popover-foreground: 210 20% 95%;
--primary: 172 80% 55%;             /* Luminous cyan — primary data color */
--primary-foreground: 222 25% 3.5%; /* Dark text on cyan */
--secondary: 222 15% 13%;           /* Subtle elevated surface */
--secondary-foreground: 210 20% 90%;
--muted: 222 15% 13%;
--muted-foreground: 222 15% 50%;    /* Secondary text, readable on black */
--accent: 38 90% 60%;               /* Warm amber — CTAs, highlights */
--accent-foreground: 222 25% 3.5%;
--destructive: 0 70% 55%;
--destructive-foreground: 0 0% 98%;
--border: 222 15% 12%;              /* Subtle, glow-ready */
--input: 222 15% 12%;
--ring: 172 80% 55%;                /* Focus ring matches primary cyan */
--radius: 0.75rem;                  /* Slightly larger radius for glass panels */
```

### Light mode (secondary, respects system preference)

```css
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
```

### Chart palette — 8 luminous hues

These must read clearly against the deep-black card backgrounds.

```css
--chart-1: 172 80% 55%;   /* Cyan — primary data */
--chart-2: 38 90% 60%;    /* Amber — warm accent */
--chart-3: 270 60% 65%;   /* Violet — tertiary */
--chart-4: 340 70% 60%;   /* Rose — fourth */
--chart-5: 145 65% 50%;   /* Lime — fifth */
--chart-6: 200 80% 60%;   /* Sky — sixth */
--chart-7: 20 85% 58%;    /* Orange — seventh */
--chart-8: 295 65% 60%;   /* Fuchsia — eighth */
--chart-accent: 172 80% 55%;  /* Matches primary cyan */
--chart-muted: 222 15% 15%;   /* Barely-there grid/background */
```

### Semantic glow tokens

```css
--glow-primary: 172 80% 55%;
--glow-accent: 38 90% 60%;
--glow-sm: 0 0 8px;
--glow-md: 0 0 20px;
--glow-lg: 0 0 40px;
```

Usage: `box-shadow: var(--glow-md) hsl(var(--glow-primary) / 0.15);`

## Typography

### Font stack

```css
body {
  font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
}

h1, h2, .font-display {
  font-family: 'Syne', ui-sans-serif, system-ui, sans-serif;
}

.font-mono, .font-data, [data-slot="stat"], .tabular-nums, code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
```

### Type scale

| Element | Font | Weight | Size | Tracking |
|---------|------|--------|------|----------|
| Hero h1 | Syne | 800 | 4xl (mobile) / 6xl (desktop) | -0.03em |
| Page h1 | Syne | 700 | 3xl / 4xl | -0.02em |
| Section h2 | Syne | 700 | 2xl / 3xl | -0.02em |
| Card title | Outfit | 600 | lg | -0.01em |
| Body | Outfit | 400 | base (16px) | 0 |
| Small/caption | Outfit | 400 | sm | 0 |
| Stat value | JetBrains Mono | 700 | 3xl | -0.02em |
| Stat label | Outfit | 400 | sm | 0.02em (uppercase) |
| Chart labels | Outfit | 400 | xs | 0 |

## Effects & Atmosphere

### Grain texture

A CSS pseudo-element on `body::after` or a dedicated `<div className="grain-overlay">`:

```css
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,..."); /* noise SVG or generated noise */
  mix-blend-mode: overlay;
}
```

Alternatively use a CSS filter noise approach for smaller bundle size.

### Atmospheric gradients

Positioned behind key content sections. NOT on every element — just 2-3 per page max.

```css
.atmosphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

/* Example: behind dashboard stat row */
.atmosphere-cyan {
  background: hsl(172 80% 55% / 0.06);
  width: 600px;
  height: 400px;
}

/* Example: behind hero section */
.atmosphere-amber {
  background: hsl(38 90% 60% / 0.05);
  width: 500px;
  height: 500px;
}
```

### Glass panels (cards)

```css
.glass-card {
  background: hsl(var(--card) / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: var(--radius);
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
}

.glass-card:hover {
  border-color: hsl(var(--primary) / 0.2);
  box-shadow: 0 0 20px hsl(var(--glow-primary) / 0.08);
}
```

### Glow utilities

Tailwind-compatible utility classes:

```css
.glow-primary { box-shadow: 0 0 20px hsl(var(--glow-primary) / 0.15); }
.glow-accent  { box-shadow: 0 0 20px hsl(var(--glow-accent) / 0.15); }
.glow-sm      { box-shadow: 0 0 8px hsl(var(--glow-primary) / 0.1); }
.glow-lg      { box-shadow: 0 0 40px hsl(var(--glow-primary) / 0.12); }
```

## Motion System

### Framer Motion variants

```typescript
// Page transition
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Staggered card reveal (dashboard)
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

// Data materialize (stat numbers)
export const dataMaterialize = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Scroll reveal (below-fold content)
export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};
```

### Motion rules

- `prefers-reduced-motion: reduce` disables all framer-motion animations (set `transition: { duration: 0 }`)
- Maximum 2-3 animated elements visible simultaneously
- Never animate layout-affecting properties (width, height) — only transform and opacity
- Exit animations are 50% the duration of enter animations

## Page Designs

### Landing Page (`App.tsx`)

**Layout:**
1. **Hero section** — full viewport height
   - Syne 800 heading: "See your YouTube habits in a new light"
   - Outfit 400 subtext below
   - Two CTAs: primary (cyan glow) "Get Started" and ghost "Learn More"
   - Atmospheric gradient orbs behind the text (cyan top-left, amber bottom-right)
   - Staggered word reveal on the heading using framer-motion

2. **Feature section** — 3 glass cards in a row (stacked on mobile)
   - Each card: icon at top, Syne heading, Outfit description
   - Cards stagger in on scroll
   - Subtle glow on hover

3. **Data preview section** — a mocked/blurred dashboard screenshot or simplified chart previews inside glass panels
   - Scroll-triggered reveal
   - Shows what the user will get

4. **CTA section** — centered, atmospheric gradient backdrop
   - "Start exploring your data" with glowing cyan button
   - Subtle ambient glow pulse on the button

5. **Footer** — minimal, muted text, links

### Login Page (`Login.tsx`)

**Layout:**
- Centered glass card over the atmospheric background
- Logo with subtle glow
- "Welcome back" in Syne 700
- Google sign-in button with amber accent color
- Privacy/TOS links below in muted text
- Background has a single large atmospheric gradient orb

### Dashboard (`Dashboard.tsx`)

**Header:**
- Glass-effect sticky navbar
- Logo left, user profile right
- Subtle bottom border with primary glow on scroll

**Tab system:**
- Two tabs: "Liked Videos" / "Watch History"
- Active tab has cyan underline that animates with spring physics between tabs
- Tab labels in Outfit 500

**Liked Videos tab:**
- **Stat row** (top): 3 glass stat cards, JetBrains Mono numbers with subtle cyan glow, stagger in on tab switch
- **YouTube sync section**: Glass panel with amber CTA
- **Charts grid**: 2-column on desktop, 1-column mobile. Each chart in a glass card:
  - Chart backgrounds transparent (data floats in the dark)
  - Data lines/bars use the luminous chart palette
  - Tooltips are glass panels
  - Cards stagger in with 80ms delay each
- **Chart order**: Category Distribution, Shorts vs Regular, Monthly Trends, Top Channels, Top Keywords, Channel Loyalty, Video Length, Likes Heatmap

**Watch History tab:**
- **Upload card**: Glass panel with drag-drop zone that glows cyan on drag-over
- **Highlight stats**: 4 glass cards in a row (staggered reveal)
- **Charts grid**: Same glass-card treatment
- **Nudges section**: Glass card with amber accent icon

### Shared components affected

All existing components get the glass-card treatment + token-driven colors:
- `Card` → glass-card variant with backdrop-blur
- `Button` → primary uses cyan glow, accent uses amber
- `Badge` → luminous variants
- `Tabs` → animated underline
- `Progress` → cyan fill with glow
- `LoadingSpinner` → cyan spinner on dark background
- `ChartTooltip` → glass panel styling

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/motion.ts` | Framer Motion variant definitions |
| `src/components/GrainOverlay.tsx` | Film grain texture overlay |
| `src/components/Atmosphere.tsx` | Reusable atmospheric gradient orb |
| `src/components/GlassCard.tsx` | Glass card wrapper (extends shadcn Card) |
| `src/components/AnimatedPage.tsx` | Page transition wrapper |
| `src/components/StatCard.tsx` | Stat display with JetBrains Mono + glow |
| `src/components/AnimatedTabs.tsx` | Tabs with spring-animated underline |

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | New color tokens, font imports, glow utilities, grain overlay, glass-card styles, atmospheric gradient styles |
| `src/pages/App.tsx` | Full landing page redesign with hero, features, data preview, CTA |
| `src/pages/Login.tsx` | Glass panel login with atmospheric background |
| `src/pages/Dashboard.tsx` | Glass cards, staggered reveals, animated tabs, atmospheric gradients |
| `src/pages/Logout.tsx` | Cinematic loading state |
| `src/router.tsx` | AnimatePresence for page transitions |
| `src/components/LoadingSpinner.tsx` | Cyan-themed spinner |
| `src/components/ChartTooltip.tsx` | Glass panel tooltip |
| All chart components (13 files) | Glass-card wrappers, luminous chart colors (already tokenized) |
| `src/components/WatchHistoryUploadCard.tsx` | Glass panel, cyan glow drag-drop |
| `src/components/YouTubeSyncButton.tsx` | Amber CTA styling |
| `src/components/LikedVideosStats.tsx` | StatCard with glow |
| `src/components/WatchHistoryHighlights.tsx` | StatCard with glow |
| `src/components/UserProfile.tsx` | Glass panel style |
| `src/components/GoogleAuthButton.tsx` | Amber accent |
| `src/extensions/shadcn/components/card.tsx` | Glass variant |
| `src/extensions/shadcn/components/button.tsx` | Glow variants |
| `package.json` | Add framer-motion dependency |

## Implementation order

1. Install framer-motion, update font imports
2. Rewrite index.css with full Deep Field token system + utility classes
3. Create shared primitives (GlassCard, Atmosphere, GrainOverlay, motion.ts, StatCard, AnimatedPage, AnimatedTabs)
4. Update shadcn base components (Card glass variant, Button glow variants)
5. Redesign Landing page
6. Redesign Login page
7. Redesign Dashboard structure (header, tabs, layout)
8. Update all Liked Videos tab components
9. Update all Watch History tab components
10. Add page transitions to router
11. Final polish pass — spacing, glow intensity tuning, motion timing

## Success criteria

- Every screen feels cinematic, not like a template
- Data appears to emit light — charts and stats glow against the deep background
- Motion is orchestrated, not scattered — staggered reveals feel deliberate
- Typography hierarchy is immediately clear: Syne for headings, Outfit for body, JetBrains Mono for data
- Works on mobile (375px) through desktop (1440px+)
- Respects prefers-reduced-motion
- No new TypeScript errors
- Existing functionality unchanged — all data flows, API calls, and auth work identically
