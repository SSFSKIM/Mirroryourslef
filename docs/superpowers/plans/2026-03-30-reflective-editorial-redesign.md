# Reflective Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild MirrorYourself's active frontend into the approved light-first Reflective Editorial system while preserving all existing authentication, sync, upload, and analytics behavior.

**Architecture:** Replace the active theme bootstrap and CSS token system first so the app defaults to the new paper-and-ink editorial look. Then introduce a small set of reusable editorial primitives, redesign public surfaces, and finally restage the dashboard shell and high-visibility analytics modules so the product reads like a personal report instead of a generic card grid.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui primitives, Zustand stores, Recharts, Firebase Auth

**Spec:** `docs/superpowers/specs/2026-03-30-reflective-editorial-redesign-design.md`

---

## File Map

### Theme foundation

- Modify `view-time (5)/frontend/src/index.css`
  Responsibility: light-first editorial tokens, typography roles, panel utilities, state styling, and responsive utility classes.
- Modify `view-time (5)/frontend/src/AppWrapper.tsx`
  Responsibility: pass the new default theme through the real app bootstrap.
- Modify `view-time (5)/frontend/src/constants/default-theme.ts`
  Responsibility: set the new default theme value.
- Modify `view-time (5)/frontend/src/internal-components/ThemeProvider.tsx`
  Responsibility: version or reset legacy theme persistence so existing users are not stuck on the old dark default.

### Shared presentation primitives

- Create `view-time (5)/frontend/src/components/EditorialPanel.tsx`
  Responsibility: framed panel primitive for primary/secondary editorial surfaces.
- Create `view-time (5)/frontend/src/components/SectionIntro.tsx`
  Responsibility: shared eyebrow + headline + deck pattern for landing and dashboard sections.
- Create `view-time (5)/frontend/src/components/AnalyticsPanel.tsx`
  Responsibility: chart/stat wrapper with title, optional eyebrow, optional interpretive caption, and consistent inner spacing.
- Modify `view-time (5)/frontend/src/components/Button.tsx`
  Responsibility: editorial button variants and touch target sizing.
- Modify `view-time (5)/frontend/src/components/Card.tsx`
  Responsibility: align base card shell with the new paper/fog framing language.
- Modify `view-time (5)/frontend/src/components/GlassCard.tsx`
  Responsibility: compatibility shim so untouched call sites inherit the new panel language without a separate full refactor.
- Modify `view-time (5)/frontend/src/components/StatCard.tsx`
  Responsibility: strong stat-block composition instead of glass metric tile styling.

### Public surfaces

- Modify `view-time (5)/frontend/src/pages/App.tsx`
  Responsibility: cover-story landing layout, editorial feature spreads, privacy framing.
- Modify `view-time (5)/frontend/src/pages/Login.tsx`
  Responsibility: front-matter login layout with responsive two-region composition.
- Modify `view-time (5)/frontend/src/app/auth/SignInOrUpForm.tsx`
  Responsibility: allow the FirebaseUI surface to sit cleanly inside the new login framing without changing auth behavior.
- Modify `view-time (5)/frontend/src/components/AuthSection.tsx`
  Responsibility: header auth/navigation placement inside the editorial top bar.
- Modify `view-time (5)/frontend/src/components/GoogleAuthButton.tsx`
  Responsibility: align Google sign-in button styling with the editorial button system.
- Modify `view-time (5)/frontend/src/components/HeatMapPreview.tsx`
  Responsibility: landing preview module for rhythm/story section.
- Modify `view-time (5)/frontend/src/components/DonutChartPreview.tsx`
  Responsibility: landing preview module for taste/story section.
- Modify `view-time (5)/frontend/src/components/TopChannelsPreview.tsx`
  Responsibility: landing preview module for creator/story section.

### Dashboard shell

- Create `view-time (5)/frontend/src/components/DashboardMasthead.tsx`
  Responsibility: title, deck, identity strip, and summary-band framing for the dashboard opener.
- Modify `view-time (5)/frontend/src/pages/Dashboard.tsx`
  Responsibility: section framing, responsive composition, display labels, and module hierarchy.
- Modify `view-time (5)/frontend/src/components/UserProfile.tsx`
  Responsibility: compact masthead identity strip instead of standalone glass card.

### Liked-videos presentation

- Modify `view-time (5)/frontend/src/components/YouTubeSyncButton.tsx`
  Responsibility: editorial sync/status shell, loading/empty/error/success framing.
- Modify `view-time (5)/frontend/src/components/LikedVideosStats.tsx`
  Responsibility: convert overview metrics into editorial stat blocks.
- Modify `view-time (5)/frontend/src/components/TopKeywords.tsx`
  Responsibility: indexed term layout instead of badge cloud.
- Modify `view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx`
  Responsibility: promoted feature chart with interpretive caption.
- Modify `view-time (5)/frontend/src/components/CategoryDistribution.tsx`
  Responsibility: framed analytical plate with editorial legend/caption.
- Modify `view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx`
  Responsibility: secondary insight plate styling.
- Modify `view-time (5)/frontend/src/components/TopChannels.tsx`
  Responsibility: quieter ranked-list/sidebar treatment.
- Modify `view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx`
  Responsibility: signature rhythm visual with caption.
- Modify `view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx`
  Responsibility: primary trend panel with declarative title and caption.
- Modify `view-time (5)/frontend/src/components/VideoLengthDistribution.tsx`
  Responsibility: secondary chart plate styling.
- Modify `view-time (5)/frontend/src/components/ShortsCircularProgress.tsx`
  Responsibility: compact supporting stat/indicator styling.

### Watch-history presentation

- Modify `view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx`
  Responsibility: archive-intake framing plus loading/empty/error/success handling.
- Modify `view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx`
  Responsibility: stat-block summary band for behavior report.
- Modify `view-time (5)/frontend/src/components/SessionDurationChart.tsx`
  Responsibility: feature chart styling with caption.
- Modify `view-time (5)/frontend/src/components/RecommendationBreakdown.tsx`
  Responsibility: influence panel styling with caption.
- Modify `view-time (5)/frontend/src/components/ViewingHeatmap.tsx`
  Responsibility: signature rhythm visual with caption.
- Modify `view-time (5)/frontend/src/components/InAppNudges.tsx`
  Responsibility: editorial notes treatment for heuristics.
- Modify `view-time (5)/frontend/src/components/RepeatWatchList.tsx`
  Responsibility: ranked-list/sidebar treatment.

### Verification

- Use `@superpowers:verification-before-completion` before claiming the redesign is complete.
- Run `cd "view-time (5)/frontend" && yarn lint`
- Run `cd "view-time (5)/frontend" && yarn build`
- For manual QA after a successful build, serve the app with `cd "view-time (5)/frontend" && yarn preview --host 127.0.0.1 --port 4173`
- Perform manual QA on `/`, `/login`, and `/dashboard` in desktop and mobile widths.

## Chunk 1: Theme Foundation And Public Surfaces

### Task 1: Replace Theme Bootstrap And Global Tokens

**Files:**
- Modify: `view-time (5)/frontend/src/constants/default-theme.ts`
- Modify: `view-time (5)/frontend/src/internal-components/ThemeProvider.tsx`
- Modify: `view-time (5)/frontend/src/AppWrapper.tsx`
- Modify: `view-time (5)/frontend/src/index.css`

- [ ] **Step 1: Change the app default theme to light**

Update `view-time (5)/frontend/src/constants/default-theme.ts` so `DEFAULT_THEME` exports `"light"` instead of `"dark"`.

- [ ] **Step 2: Reset legacy theme persistence**

In `view-time (5)/frontend/src/internal-components/ThemeProvider.tsx`, change the storage key to a new versioned value such as ``databutton-${__APP_ID__}-ui-theme-editorial-v1`` so previously saved dark-mode state does not keep existing users on the old theme.

Expected result: a fresh or previously dark-stored session resolves to the new light-first theme on first load.

- [ ] **Step 3: Check whether the duplicate theme provider is dead code**

Run: `cd "/Users/new/Documents/GitHub/Mirroryourslef" && rg -n "components/ThemeProvider|from \\\"components/ThemeProvider\\\"|from 'components/ThemeProvider'" "view-time (5)/frontend/src"`

Expected: no active imports. If any import is found, add `view-time (5)/frontend/src/components/ThemeProvider.tsx` to Task 1 and update it to match the new default-theme behavior in the same commit.

- [ ] **Step 4: Keep the real bootstrap wired to the new default**

In `view-time (5)/frontend/src/AppWrapper.tsx`, keep `ThemeProvider`, `RouterProvider`, `Head`, and `OuterErrorBoundary` in place, but confirm the wrapper passes the new light default without introducing any alternate theme bootstrap path.

- [ ] **Step 5: Rewrite `index.css` into the editorial token system**

Replace the dark-glass token emphasis in `view-time (5)/frontend/src/index.css` with the approved light-first editorial system:

- paper/ink/fog/rule/signal tokens
- preserved current font stack (`Syne`, `Instrument Sans`, `Instrument Serif`, `JetBrains Mono`)
- new utility classes for section eyebrows, divider rules, editorial panels, stat blocks, notes, and chart captions
- loading, empty, and error state styling that fits the editorial system
- removal of glass/glow as the default visual language

- [ ] **Step 6: Run the frontend lint check**

Run: `cd "view-time (5)/frontend" && yarn lint`

Expected: command exits `0`.

- [ ] **Step 7: Run the production build**

Run: `cd "view-time (5)/frontend" && yarn build`

Expected: Vite build completes successfully and writes updated assets to `dist/`.

- [ ] **Step 8: Commit the foundation change**

```bash
git add "view-time (5)/frontend/src/constants/default-theme.ts" \
  "view-time (5)/frontend/src/internal-components/ThemeProvider.tsx" \
  "view-time (5)/frontend/src/AppWrapper.tsx" \
  "view-time (5)/frontend/src/index.css"
git commit -m "feat: establish reflective editorial theme foundation"
```

### Task 2: Add Reusable Editorial Primitives And Compatibility Shims

**Files:**
- Create: `view-time (5)/frontend/src/components/EditorialPanel.tsx`
- Create: `view-time (5)/frontend/src/components/SectionIntro.tsx`
- Create: `view-time (5)/frontend/src/components/AnalyticsPanel.tsx`
- Modify: `view-time (5)/frontend/src/components/Button.tsx`
- Modify: `view-time (5)/frontend/src/components/Card.tsx`
- Modify: `view-time (5)/frontend/src/components/GlassCard.tsx`
- Modify: `view-time (5)/frontend/src/components/StatCard.tsx`

- [ ] **Step 1: Create `EditorialPanel.tsx`**

Build a focused wrapper with 2-3 tone variants such as `primary`, `secondary`, and `quiet` so pages and modules can share the same framed panel language without repeating long class strings.

- [ ] **Step 2: Create `SectionIntro.tsx`**

Implement a small presentational component that renders:

- optional eyebrow
- required title
- optional deck
- optional trailing action slot

This will be reused by landing sections and dashboard sections.

- [ ] **Step 3: Create `AnalyticsPanel.tsx`**

Implement a wrapper for data modules with:

- optional eyebrow
- title
- optional caption
- inner content area
- optional `className` passthrough for dominant vs secondary sizing

- [ ] **Step 4: Rework the shared shells to use the new editorial language**

Modify:

- `Button.tsx` to support editorial primary, framed secondary, and text/ghost actions without glow-dependent styling
- `Card.tsx` to align default card spacing and borders with paper/fog framing
- `GlassCard.tsx` to become a compatibility shim over the new panel language instead of a blur-first component, while still accepting the current `hover` and `stagger` props so existing call sites do not break mid-migration
- `StatCard.tsx` to render large ink/data values, concise labels, and short captions as stat blocks

- [ ] **Step 5: Run lint and build after the primitive refactor**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Expected: both commands exit successfully.

- [ ] **Step 6: Commit the primitive layer**

```bash
git add "view-time (5)/frontend/src/components/EditorialPanel.tsx" \
  "view-time (5)/frontend/src/components/SectionIntro.tsx" \
  "view-time (5)/frontend/src/components/AnalyticsPanel.tsx" \
  "view-time (5)/frontend/src/components/Button.tsx" \
  "view-time (5)/frontend/src/components/Card.tsx" \
  "view-time (5)/frontend/src/components/GlassCard.tsx" \
  "view-time (5)/frontend/src/components/StatCard.tsx"
git commit -m "feat: add reflective editorial presentation primitives"
```

### Task 3: Redesign The Landing Page As A Cover Story

**Files:**
- Modify: `view-time (5)/frontend/src/pages/App.tsx`
- Modify: `view-time (5)/frontend/src/components/AuthSection.tsx`
- Modify: `view-time (5)/frontend/src/components/GoogleAuthButton.tsx`
- Modify: `view-time (5)/frontend/src/components/HeatMapPreview.tsx`
- Modify: `view-time (5)/frontend/src/components/DonutChartPreview.tsx`
- Modify: `view-time (5)/frontend/src/components/TopChannelsPreview.tsx`

- [ ] **Step 1: Rebuild the landing header and hero**

In `view-time (5)/frontend/src/pages/App.tsx`, replace the current dark-glass hero composition with:

- editorial top bar
- headline + deck opener
- stronger CTA language
- one dominant visual anchor instead of orb-heavy atmosphere

Keep existing route targets and auth actions unchanged.

- [ ] **Step 2: Replace the feature-card section with editorial spreads**

Use `SectionIntro` plus the preview modules to create 2-3 larger story sections that frame:

- rhythm
- taste profile
- creator patterns

These sections should read as story spreads, not a utility card grid.

- [ ] **Step 3: Make privacy a first-class landing section**

Add a dedicated section in `App.tsx` that explains the privacy-first product stance in editorial language, using a quiet panel rather than footer-only treatment.

- [ ] **Step 4: Restyle header auth controls**

Update `AuthSection.tsx` and `GoogleAuthButton.tsx` so the top-right auth area fits the new masthead styling while keeping sign-in/out behavior unchanged.

- [ ] **Step 5: Rework the preview modules to match the new system**

Update `HeatMapPreview.tsx`, `DonutChartPreview.tsx`, and `TopChannelsPreview.tsx` so they read like analytical illustrations on paper panels instead of blurred mini-cards.

- [ ] **Step 6: Verify the landing page**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Then manually verify:

- desktop `http://localhost:4173/` or equivalent preview
- mobile width around `390px`

Expected: hero, story sections, and privacy block stack correctly with no console or layout errors.

- [ ] **Step 7: Commit the landing redesign**

```bash
git add "view-time (5)/frontend/src/pages/App.tsx" \
  "view-time (5)/frontend/src/components/AuthSection.tsx" \
  "view-time (5)/frontend/src/components/GoogleAuthButton.tsx" \
  "view-time (5)/frontend/src/components/HeatMapPreview.tsx" \
  "view-time (5)/frontend/src/components/DonutChartPreview.tsx" \
  "view-time (5)/frontend/src/components/TopChannelsPreview.tsx"
git commit -m "feat: redesign landing page in reflective editorial style"
```

### Task 4: Rebuild Login As Editorial Front Matter

**Files:**
- Modify: `view-time (5)/frontend/src/pages/Login.tsx`
- Modify: `view-time (5)/frontend/src/app/auth/SignInOrUpForm.tsx`

- [ ] **Step 1: Restructure `Login.tsx` into a two-region composition**

Implement a desktop/tablet split with:

- editorial framing copy on one side
- sign-in surface on the other

Below `1024px`, collapse to a single-column stack with the framing copy above the sign-in block.

- [ ] **Step 2: Keep the auth widget presentationally flexible**

In `view-time (5)/frontend/src/app/auth/SignInOrUpForm.tsx`, add only the minimal wrapper hooks or class/container support needed so the FirebaseUI surface can sit cleanly inside the new panel without changing auth provider behavior.

- [ ] **Step 3: Add privacy reassurance and concise “what you get” framing**

Keep legal links and sign-in function intact, but restage the text to explain:

- rhythm
- taste
- sessions
- privacy-first handling

- [ ] **Step 4: Verify the login page**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Then manually verify `/login` at desktop and mobile widths. Expected: single Google sign-in action remains functional and visually centered within the new editorial layout.

- [ ] **Step 5: Commit the login redesign**

```bash
git add "view-time (5)/frontend/src/pages/Login.tsx" \
  "view-time (5)/frontend/src/app/auth/SignInOrUpForm.tsx"
git commit -m "feat: redesign login page as editorial front matter"
```

## Chunk 2: Dashboard Shell, Analytics Modules, And Final Verification

### Task 5: Rebuild The Dashboard Shell Around A Masthead And Section Rhythm

**Files:**
- Create: `view-time (5)/frontend/src/components/DashboardMasthead.tsx`
- Modify: `view-time (5)/frontend/src/pages/Dashboard.tsx`
- Modify: `view-time (5)/frontend/src/components/UserProfile.tsx`

- [ ] **Step 1: Create `DashboardMasthead.tsx`**

Build a focused component that renders:

- `Your Latest Edition`
- a short deck
- user identity strip
- one summary band region for compact key metrics or status text

- [ ] **Step 2: Replace generic dashboard headings and grid framing**

In `view-time (5)/frontend/src/pages/Dashboard.tsx`:

- keep internal tab values as `liked-videos` and `watch-history`
- change visible labels to `Taste Profile` and `Behavior Report`
- replace `Overview` / `Detailed Analytics` headings with editorial section framing
- stage one dominant module area and quieter supporting rows per section

- [ ] **Step 3: Restyle the profile shell**

Update `view-time (5)/frontend/src/components/UserProfile.tsx` so it behaves like a compact masthead identity strip rather than a standalone glass card.

- [ ] **Step 4: Make the shell responsive**

Ensure `Dashboard.tsx` matches the spec:

- single-column flow below `640px`
- compact stacked summary below `1024px`
- no horizontal scroll in metric rows or tab headers

- [ ] **Step 5: Verify the dashboard shell**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Then manually verify `/dashboard` with mock or real data if available. Expected: the page opens with the new masthead and both tabs remain reachable.

- [ ] **Step 6: Commit the shell refactor**

```bash
git add "view-time (5)/frontend/src/components/DashboardMasthead.tsx" \
  "view-time (5)/frontend/src/pages/Dashboard.tsx" \
  "view-time (5)/frontend/src/components/UserProfile.tsx"
git commit -m "feat: restructure dashboard shell for reflective editorial layout"
```

### Task 6: Translate Liked-Videos Surfaces Into Editorial Analytics Panels

**Files:**
- Modify: `view-time (5)/frontend/src/components/YouTubeSyncButton.tsx`
- Modify: `view-time (5)/frontend/src/components/LikedVideosStats.tsx`
- Modify: `view-time (5)/frontend/src/components/TopKeywords.tsx`
- Modify: `view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx`
- Modify: `view-time (5)/frontend/src/components/CategoryDistribution.tsx`
- Modify: `view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx`
- Modify: `view-time (5)/frontend/src/components/TopChannels.tsx`
- Modify: `view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx`
- Modify: `view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx`
- Modify: `view-time (5)/frontend/src/components/VideoLengthDistribution.tsx`
- Modify: `view-time (5)/frontend/src/components/ShortsCircularProgress.tsx`

- [ ] **Step 1: Reframe sync and overview states**

Update `YouTubeSyncButton.tsx` and `LikedVideosStats.tsx` so loading, empty, success, and error states read like report status rather than generic app alerts. Keep all OAuth and sync behavior unchanged.

- [ ] **Step 2: Promote the key liked-videos visuals**

Use `AnalyticsPanel` as the standard wrapper inside:

- `ShortsVsRegularChart.tsx`
- `CategoryDistribution.tsx`
- `LikesTimeHeatmap.tsx`
- `MonthlyTrendsChart.tsx`

Add one-line interpretive captions to the dominant charts.

- [ ] **Step 3: Quiet the supporting liked-videos modules**

Restyle:

- `TopKeywords.tsx` into an indexed term cluster
- `ChannelLoyaltyInsight.tsx`
- `TopChannels.tsx`
- `VideoLengthDistribution.tsx`
- `ShortsCircularProgress.tsx`

so they support the main story instead of competing equally with it.

- [ ] **Step 4: Verify no state regressions on the liked-videos side**

Manually verify:

- first-run/no-sync state
- syncing/loading state
- successful sync summary
- visible error state when sync status includes an error

Expected: the new styling does not hide actions, counts, or status messaging.

- [ ] **Step 5: Run lint and build**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Expected: both commands succeed.

- [ ] **Step 6: Commit the liked-videos redesign**

```bash
git add "view-time (5)/frontend/src/components/YouTubeSyncButton.tsx" \
  "view-time (5)/frontend/src/components/LikedVideosStats.tsx" \
  "view-time (5)/frontend/src/components/TopKeywords.tsx" \
  "view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx" \
  "view-time (5)/frontend/src/components/CategoryDistribution.tsx" \
  "view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx" \
  "view-time (5)/frontend/src/components/TopChannels.tsx" \
  "view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx" \
  "view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx" \
  "view-time (5)/frontend/src/components/VideoLengthDistribution.tsx" \
  "view-time (5)/frontend/src/components/ShortsCircularProgress.tsx"
git commit -m "feat: redesign liked-videos analytics panels"
```

### Task 7: Translate Watch-History Surfaces Into A Behavior Report

**Files:**
- Modify: `view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx`
- Modify: `view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx`
- Modify: `view-time (5)/frontend/src/components/SessionDurationChart.tsx`
- Modify: `view-time (5)/frontend/src/components/RecommendationBreakdown.tsx`
- Modify: `view-time (5)/frontend/src/components/ViewingHeatmap.tsx`
- Modify: `view-time (5)/frontend/src/components/InAppNudges.tsx`
- Modify: `view-time (5)/frontend/src/components/RepeatWatchList.tsx`

- [ ] **Step 1: Reframe upload as archive intake**

Update `WatchHistoryUploadCard.tsx` so the upload, validation, loading, success, and delete states read like archive intake and report preparation while keeping the existing upload/delete behavior untouched.

- [ ] **Step 2: Convert highlights into an editorial summary band**

Restyle `WatchHistoryHighlights.tsx` to align with the new stat-block system and ensure first-run empty messaging still points users toward the upload action.

- [ ] **Step 3: Promote the main watch-history visuals**

Use `AnalyticsPanel` as the standard wrapper inside:

- `SessionDurationChart.tsx`
- `RecommendationBreakdown.tsx`
- `ViewingHeatmap.tsx`

Add concise interpretive captions to the dominant charts.

- [ ] **Step 4: Translate nudges and repeats into editorial side content**

Update:

- `InAppNudges.tsx` into `Editorial Notes` / `What Stands Out`
- `RepeatWatchList.tsx` into a quieter ranked sidebar/list treatment

while keeping the existing heuristic messaging logic intact.

- [ ] **Step 5: Verify the watch-history states**

Manually verify:

- no-upload empty state
- dragging/selection affordances
- upload in progress
- successful import summary
- validation error
- delete/reset flow

Expected: each state remains clear, inline, and visually consistent with the editorial system.

- [ ] **Step 6: Run lint and build**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Expected: both commands succeed.

- [ ] **Step 7: Commit the watch-history redesign**

```bash
git add "view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx" \
  "view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx" \
  "view-time (5)/frontend/src/components/SessionDurationChart.tsx" \
  "view-time (5)/frontend/src/components/RecommendationBreakdown.tsx" \
  "view-time (5)/frontend/src/components/ViewingHeatmap.tsx" \
  "view-time (5)/frontend/src/components/InAppNudges.tsx" \
  "view-time (5)/frontend/src/components/RepeatWatchList.tsx"
git commit -m "feat: redesign watch-history report surfaces"
```

### Task 8: Final Responsive Pass, Regression Check, And Release Commit

**Files:**
- Modify: any files touched in Tasks 1-7 as needed for final responsive, spacing, accessibility, or copy cleanup

- [ ] **Step 1: Do a focused desktop/manual QA pass**

Verify:

- `/` landing page at desktop width
- `/login` at desktop width
- `/dashboard` liked-videos tab at desktop width
- `/dashboard` watch-history tab at desktop width

Expected: section rhythm, mastheads, buttons, captions, and panel hierarchy match the spec.

- [ ] **Step 2: Do a focused mobile/manual QA pass**

Verify the same routes at approximately `390px` width.

Expected:

- no horizontal scrolling
- login collapses to one column
- dashboard summary bands stack cleanly
- upload/sync actions remain reachable

- [ ] **Step 3: Check loading, empty, and error states one more time**

Reconfirm that editorial styling is applied to:

- liked-videos no-data state
- watch-history no-data state
- upload error/validation state
- sync error state

- [ ] **Step 4: Run final verification**

Run:

- `cd "view-time (5)/frontend" && yarn lint`
- `cd "view-time (5)/frontend" && yarn build`

Expected: both pass with no new errors.

- [ ] **Step 5: Commit the final polish**

```bash
git add "view-time (5)/frontend/src"
git commit -m "feat: complete reflective editorial frontend redesign"
```
