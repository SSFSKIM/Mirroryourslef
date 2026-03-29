# Reflective Editorial Redesign — Contemporary Feature Magazine

**Date:** 2026-03-30
**Status:** Approved
**Scope:** `view-time (5)/frontend/src/index.css`, `view-time (5)/frontend/src/AppWrapper.tsx`, `view-time (5)/frontend/src/constants/default-theme.ts`, `view-time (5)/frontend/src/internal-components/ThemeProvider.tsx`, `view-time (5)/frontend/src/pages/App.tsx`, `view-time (5)/frontend/src/pages/Login.tsx`, `view-time (5)/frontend/src/pages/Dashboard.tsx`, shared frontend presentation components used by landing, login, and dashboard modules

## Problem

MirrorYourself's current frontend is coherent but too safe. The active interface uses a dark, glass-heavy analytics aesthetic: blurred cards, teal glow accents, atmospheric orbs, and consistent rounded surfaces. That creates polish, but it does not create a memorable product identity.

The current landing page has the strongest visual moment: a bold hero treatment with a large headline and restrained palette. After that, most of the application falls back into repeated glass cards and standard dashboard grids. The result is a product that reads as "premium SaaS analytics" instead of "MirrorYourself" as a private reflection tool.

The redesign must solve four problems:

1. The UI does not visually express the product promise of self-reflection and behavior reading.
2. The same surface language is repeated too broadly, flattening hierarchy.
3. The dashboard layout gives too many modules equal weight, making the experience feel templated.
4. The visual identity on landing, login, and dashboard does not feel sufficiently authored as one system.

## Design Direction

### Chosen Direction

Apply a full-system `Reflective Editorial` redesign with a `Contemporary Feature Magazine` tone.

This means the app should feel like a private magazine issue about the user's own media behavior. It is not a luxury lifestyle product, not a dark glass observatory, and not a forensic admin panel. It should feel authored, observational, and analytically sharp.

### Product Tone

- Light-first
- Modern magazine feature, not archival nostalgia
- Analytics-first with editorial framing
- Structured editorial layout, not broken-grid maximalism

### Core Differentiator

The memorable idea is: **your data presented like a publication about yourself**.

The user should feel like they are reading an edition assembled from their own habits, not browsing a standard dashboard.

## Goals

- Give MirrorYourself a distinct visual identity that matches its name and privacy-first positioning.
- Create one coherent system across landing, login, and dashboard.
- Preserve fast analytical scanning while adding stronger editorial hierarchy and page rhythm.
- Replace generic module repetition with deliberate emphasis, framing, and narrative structure.

## Non-Goals

- No changes to routing, authentication, data fetching, backend APIs, or analytics logic.
- No expansion of product scope beyond the existing landing, login, liked-videos, and watch-history flows.
- No new feature families such as goals, achievements, community, or notifications.
- No redesign that depends on production AI coaching or backend-managed narrative generation.

## Design DNA

### Concept

MirrorYourself should feel like a private feature story about the user's behavior. The visual system should communicate observation, interpretation, and authorship.

### Mood

- Warm paper rather than dark fog
- Ink and editorial rules rather than glow and blur
- Sharp summary bands rather than walls of equal-weight cards
- Headline/deck/caption structure rather than generic page title plus helper text

### Visual Principles

- Typography carries the identity
- Contrast and framing create hierarchy
- Data remains crisp and measurable
- Atmosphere is restrained and intentional
- The most important module in each section visually dominates

## Surface-Specific Application

### Landing Page

The landing page should behave like a cover story, not a startup homepage.

- The opening section becomes an editorial opener with headline, deck, CTA, and one abstract visual anchor grounded in analytics.
- The current small feature-card language should be replaced by 2-3 larger story sections with stronger section labels, spread-like compositions, and dominant previews.
- Privacy should become an explicit value proposition section, not just a footer/legal concern.
- CTA language should feel like opening or reading the user's personal edition instead of generic onboarding.

### Login Page

The login page should feel like front matter for the report.

- Replace the isolated centered-card feeling with a composed two-region page or equivalent editorial split.
- One region introduces the product promise in concise editorial language.
- One region contains the sign-in action and privacy reassurance.
- The page should feel calm, trustworthy, and intentional rather than detached or modal-like.

### Dashboard

The dashboard should feel like reading the latest issue while remaining fast to scan.

- The top area becomes a masthead with title, deck, and compact identity strip.
- The two major data areas should feel like issue sections rather than generic tabs:
  - `Liked Videos` becomes `Taste Profile`
  - `Watch History` becomes `Behavior Report`
- Each major section starts with a summary band that tells the user what stands out before detailed modules.
- The page rhythm should alternate between compact statistic rails and larger feature panels.
- Major insights should be visually staged; not every module should be rendered as an equal-weight card.

#### Identifier rule

These editorial names are **display labels only** for the initial redesign pass. Existing internal tab values, route structure, store keys, and backend request parameters remain unchanged unless a later dedicated refactor explicitly changes them.

### Shared Module Language

- Stats become editorial stat blocks
- Nudges become editorial notes or margin notes
- Upload flow becomes archive intake
- Chart panels become framed analytical plates
- Keyword display becomes indexed term clusters rather than SaaS pills
- Profile/header UI becomes masthead identity rather than a small glass card

### State Handling

The editorial system must cover non-happy-path UI states so the redesign remains complete in production use.

#### Loading

- Loading panels use restrained skeleton blocks, placeholder rules, or quiet text placeholders that match the editorial framing
- Avoid glow, shimmer-heavy, or glass-forward loading treatments
- Loading copy stays operational and concise

#### Empty / first-run

- Empty states should read like editorial guidance, not dead space
- They should explain what the user can unlock next on first-run liked-videos and watch-history surfaces
- Empty states may include a single primary next action, but should avoid oversized marketing CTAs inside the dashboard

#### Error / failure

- Errors use clear contrast and direct language while staying within the editorial system
- Sync/upload failures keep existing behavior but receive calmer framing than generic destructive alert cards
- Validation, sync, and upload errors remain inline with the affected module unless current product behavior already requires escalation beyond that module

#### Success / ready

- Success states for sync/upload should feel like report-status confirmation rather than celebratory marketing
- Completed import/sync surfaces should transition naturally into the editorial summary flow for the relevant section

## Visual System

### Palette

The palette should behave like editorial materials.

#### Theme policy

This redesign is a **full user-facing theme replacement** for the active product surfaces in scope. The target experience is light editorial by default on landing, login, and dashboard.

- The implementation target is a light-first system
- No user-facing dark mode parity is required in this redesign pass
- If dark tokens remain in the codebase for technical compatibility, they are fallback-only and not part of the design acceptance criteria
- QA and visual polish are judged against the light editorial experience, not against legacy dark styling

#### Base tokens

- `Paper`: warm off-white page background
- `Ink`: near-black primary text and chart ink
- `Fog`: muted neutral surface for quiet modules
- `Rule`: soft structural border/divider color
- `Signal`: restrained vermilion-red accent

#### Rationale

The current teal glow language reads as modern SaaS. A restrained vermilion accent better supports a contemporary editorial voice and clearly separates the redesign from the current dark-glass system.

#### Chart palette

Charts may use multiple colors, but the palette must read as printed and deliberate rather than luminous. Suitable tones include muted coral, slate blue, olive, ochre, smoke, and carbon.

### Typography Roles

Typography should define the product voice.

Font decision for this redesign pass:

- Retain the current font stack already in the app as the implementation baseline: `Syne` for display, `Instrument Sans` for body/UI copy, `Instrument Serif` for selective editorial emphasis, and `JetBrains Mono` for numeric/data treatment
- Reassign those fonts into the new editorial hierarchy rather than opening a separate font-acquisition task
- Font replacement is out of scope for the initial implementation plan unless a later dedicated design task explicitly changes it

- `Display`: hero headings, mastheads, major section openers
- `Deck`: short explanatory paragraph under major headings
- `Body`: explanatory copy, upload guidance, informational text
- `Caption`: metadata, section labels, timestamps, interpretive chart captions
- `Data`: monospaced/tabular treatment for numeric emphasis and chart references

Key rule: headings should feel authored; data should feel measured.

### Surface Treatment

Glass is no longer the default component language.

- Primary modules use framed panels or quiet paper/fog contrast
- Secondary modules use lighter inset blocks
- Highlight modules use stronger borders, section labels, or accent rules
- Blur and glow are removed or reduced to rare accent usage only

### Framing And Spacing

- Use thin rules, whitespace, and section labels to create structure
- Increase vertical rhythm between sections
- Reduce overuse of enclosed rounded boxes
- Favor layouts that read like spreads instead of repeated card walls

### Motion

Motion should feel editorial rather than floaty.

- Crisp section reveals
- Number materialization for key statistics
- Controlled hover states
- Minimal atmospheric motion
- Reduced reliance on soft drifting/fade-up patterns

## Layout Rules

### Dashboard Hierarchy

Each major section should follow a structured hierarchy:

1. Section label
2. Headline
3. Deck or summary sentence
4. Summary band or stat rail
5. Dominant feature module
6. Supporting analytical sidebars or secondary rows

### Grid Posture

The dashboard remains grid-based but not uniform.

- One dominant feature module per section
- Supporting modules grouped more quietly
- Some sections should read as two-column editorial spreads rather than 3-up utility grids
- Module weight follows insight importance, not component availability

### Naming Frame

Replace generic headings such as `Overview` and `Detailed Analytics` with editorial structure.

Recommended naming:

- Dashboard masthead: `Your Latest Edition`
- Liked-videos section: `Taste Profile`
- Watch-history section: `Behavior Report`
- Supporting labels: `Signals`, `Patterns`, `Creators`, `Rhythm`, `Sessions`, `Influence`, `Timing`, `Repetition`
- Nudge area: `Editorial Notes` or `What Stands Out`

### Responsive Rules

The redesign must preserve usability on smaller screens without inventing a separate mobile product.

#### Global breakpoints

- `<640px`: single-column, stacked reading flow
- `640px-1023px`: compact editorial layout with selective two-column groupings only where charts remain legible
- `>=1024px`: full structured editorial compositions with dominant modules and asymmetric emphasis

#### Landing behavior

- Hero content remains centered or slightly offset, but all major sections collapse to one column below `1024px`
- Spread-like story sections become vertically stacked text-first modules on small screens
- Any decorative anchor visual must move below or behind the copy if it competes with readability on mobile

#### Login behavior

- The two-region login composition is desktop/tablet only
- Below `1024px`, login collapses to a single-column stack with framing copy above the sign-in action
- Privacy/supporting text must remain visible without requiring lateral scrolling or visual overlap

#### Dashboard behavior

- Masthead summary band becomes a vertical stack below `1024px`
- Dominant feature modules collapse to full-width single-column panels below `1024px`
- Supporting sidebars collapse beneath the dominant module in priority order
- Metric rails may compress to 2-up or 1-up depending on readability; no metric row may require horizontal scrolling
- Chart captions remain visible and attached to their charts at all breakpoints

## Component Translation

This defines the unit boundaries for implementation planning.

### Theme Foundation

Responsibility:

- Global tokens
- Typography roles
- base surfaces
- border/rule language
- button emphasis
- focus/interactive style

Primary files:

- `view-time (5)/frontend/src/index.css`
- `view-time (5)/frontend/src/AppWrapper.tsx`
- `view-time (5)/frontend/src/constants/default-theme.ts`
- `view-time (5)/frontend/src/internal-components/ThemeProvider.tsx`
- shared button and primitive wrappers used across pages

### Public Page Shell

Responsibility:

- landing hero structure
- section framing
- login composition
- top-level page rhythm
- header/footer presentation

Primary files:

- `view-time (5)/frontend/src/pages/App.tsx`
- `view-time (5)/frontend/src/pages/Login.tsx`

Component inventory:

- `Button`: visual treatment update allowed; interaction semantics unchanged
- `AuthSection`: header placement/copy/styling changes allowed; auth behavior unchanged
- `AnimatedPage`: motion tuning allowed; route/page semantics unchanged
- `SignInOrUpForm`: presentational restyling, spacing, and wrapper restructuring allowed inside the login page composition; auth provider behavior and submission flow unchanged
- `GlassCard`: may be retired, replaced, or narrowed to a rare accent role
- `Atmosphere`: may be removed or repurposed as restrained editorial texture

### Dashboard Shell

Responsibility:

- masthead
- section toggles
- summary band placement
- grid hierarchy
- section naming
- cross-module page rhythm

Primary files:

- `view-time (5)/frontend/src/pages/Dashboard.tsx`

Component inventory:

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: visual and copy changes allowed; internal values remain `liked-videos` and `watch-history`
- `UserProfile`: may be restyled into masthead identity strip; auth/user data behavior unchanged
- section wrappers and headings inside `Dashboard.tsx`: free to restructure for hierarchy and editorial rhythm
- layout grouping of existing analytics modules: free to change without altering their data contracts

### Shared Module Presentation

Responsibility:

- stat blocks
- upload intake panel
- notes/nudges treatment
- keyword cluster treatment
- chart wrappers and captions
- profile strip styling

Inclusion rule:

- All visible presentation components imported directly by `App.tsx`, `Login.tsx`, and `Dashboard.tsx`
- Their direct presentation children when those children define visible panels, charts, stat blocks, or section-level framing
- Excludes stores, auth internals, API clients, router setup, and backend-facing logic modules

Primary files:

- `view-time (5)/frontend/src/components/YouTubeSyncButton.tsx`
- `view-time (5)/frontend/src/components/LikedVideosStats.tsx`
- `view-time (5)/frontend/src/components/ShortsVsRegularChart.tsx`
- `view-time (5)/frontend/src/components/TopKeywords.tsx`
- `view-time (5)/frontend/src/components/VideoLengthDistribution.tsx`
- `view-time (5)/frontend/src/components/TopChannels.tsx`
- `view-time (5)/frontend/src/components/LikesTimeHeatmap.tsx`
- `view-time (5)/frontend/src/components/MonthlyTrendsChart.tsx`
- `view-time (5)/frontend/src/components/ChannelLoyaltyInsight.tsx`
- `view-time (5)/frontend/src/components/CategoryDistribution.tsx`
- `view-time (5)/frontend/src/components/ShortsCircularProgress.tsx`
- `view-time (5)/frontend/src/components/WatchHistoryUploadCard.tsx`
- `view-time (5)/frontend/src/components/WatchHistoryHighlights.tsx`
- `view-time (5)/frontend/src/components/ViewingHeatmap.tsx`
- `view-time (5)/frontend/src/components/RepeatWatchList.tsx`
- `view-time (5)/frontend/src/components/InAppNudges.tsx`
- `view-time (5)/frontend/src/components/RecommendationBreakdown.tsx`
- `view-time (5)/frontend/src/components/SessionDurationChart.tsx`
- `view-time (5)/frontend/src/components/UserProfile.tsx`
- `view-time (5)/frontend/src/components/StatCard.tsx`

Component inventory:

- `YouTubeSyncButton`: visual/layout/copy changes allowed; sync behavior, OAuth flow, and request logic unchanged
- `WatchHistoryUploadCard`: visual/layout/copy changes allowed; upload, validation, delete, and progress behavior unchanged
- `LikedVideosStats`: visual hierarchy changes allowed; metric calculation behavior unchanged
- `WatchHistoryHighlights`: visual hierarchy changes allowed; metric calculation behavior unchanged
- `TopKeywords`: visual treatment may move from badge cluster to indexed term layout; loading/data behavior unchanged
- `InAppNudges`: visual treatment and editorial framing changes allowed; heuristic logic unchanged
- `MonthlyTrendsChart`, `ViewingHeatmap`, `LikesTimeHeatmap`, `SessionDurationChart`, `RecommendationBreakdown`, `CategoryDistribution`, `ShortsVsRegularChart`, `VideoLengthDistribution`, `TopChannels`, `ChannelLoyaltyInsight`, `ShortsCircularProgress`, `RepeatWatchList`: chart framing, captions, placement, and emphasis may change; data contracts and chart inputs unchanged
- shared stat/panel wrappers such as `StatCard`: may be restyled or replaced at the presentation layer

## Implementation Boundaries

### In Scope

- Frontend presentation layer only
- Theme tokens and CSS foundations
- Public page composition
- Dashboard composition
- Shared presentation components that visibly define the product aesthetic
- Copy adjustments needed to support the editorial framing

### Behavior Boundary

Some in-scope components contain user actions or data-loading concerns. For this redesign pass, behavior changes are constrained as follows:

- Allowed: markup restructuring, visual hierarchy, labels, helper copy, captioning, spacing, responsive ordering, and non-functional motion
- Not allowed: changes to auth flows, upload/sync logic, API contracts, store shapes, request timing, analytics computation, or deletion semantics
- If a presentational redesign requires splitting a mixed component into shell plus content, that refactor is allowed only when behavior remains functionally identical before and after the split

### Out of Scope

- Auth flow changes
- Store changes
- API changes
- Backend route or schema changes
- New analytics logic
- New product features
- Bespoke redesign work for secondary pages such as logout or legal pages; they may inherit updated global tokens, but they are not individually art-directed in this pass

## Rollout Plan

### Phase 1: Foundation

Establish the new design tokens, type hierarchy, divider/rule system, panel styles, and interaction styles.

### Phase 2: Public Surfaces

Redesign landing and login first to establish the system in simpler, lower-risk surfaces.

### Phase 3: Dashboard Shell

Redesign the dashboard masthead, section toggles, summary bands, and page-level hierarchy before altering every module.

### Phase 4: Core Modules

Translate the highest-impact modules first:

- highlights/stat blocks
- upload panel
- keywords
- nudges
- heatmaps
- primary charts

### Phase 5: Polish

- responsive tuning
- caption consistency
- accessibility and contrast checks
- reduced-motion verification
- spacing cleanup

## Guardrails

- Desktop and mobile must both feel intentional
- Analytics must remain easy to scan
- One accent color should dominate
- Avoid fallback to generic shadcn card grids
- Avoid regression into dark blur/glow-heavy styling
- Captions and section labels must remain concise and authored

## Success Criteria

- The app feels specific to MirrorYourself instead of a reusable analytics template
- Landing, login, and dashboard clearly belong to one visual system
- The dashboard reads as a personal report while staying analytically efficient
- High-value insights visually dominate over secondary modules
- The redesign is memorable without becoming decorative or hard to use
