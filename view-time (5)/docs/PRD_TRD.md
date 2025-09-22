# ViewTime PRD & TRD

Status: Draft

Version: v0.1

Last Updated: 2025-09-22

Owners: Product + Engineering

---

## Product Requirements Document (PRD)

### 1. Product Overview
ViewTime (working title) is a mobile-first analytics companion that helps users understand and manage their YouTube and Shorts consumption. The app ingests viewing history exported through Google Takeout, visualizes daily/weekly/monthly usage patterns, and surfaces AI-assisted guidance aligned with personal goals for healthier digital habits.

### 2. Goals & Success Criteria
- Deliver actionable, privacy-first insights that motivate habit change, while supporting growth and retention through engaging features.
- Provide a polished, comprehensible dashboard that makes complex time-distribution data intuitive at a glance.
- Enable users to set granular goals (time limits, content types to reduce) and receive automated coaching rooted in their real viewing behavior.

Success metrics:
- 60% of onboarded users complete initial history import within 24 hours.
- ≥50% weekly active users revisit analytics dashboards at least twice per week.
- ≥30% of goal-setters maintain or improve against their goals for four consecutive weeks.

### 3. Target Personas & Needs
- Mindful binge-watcher – spends hours on YouTube without awareness; wants simple diagnostics and guardrails.
- Productivity-focused professional – wants to reclaim focused time; needs hour-of-day heatmaps and reminders.
- Concerned parent/guardian – monitoring family habits; needs aggregated channel/category insights and progress reporting.
- Self-optimizing hobbyist – enjoys quantified-self analytics; wants deep completion-rate, shorts-session, and long-term trend analysis.

### 4. Core User Journeys
Onboarding & data import
- Connect Google account, follow guided steps to request Google Takeout export.
- Upload Takeout file; confirm scopes and privacy policies.
- Receive confirmation once history is parsed and analytics are ready.

Daily use
- Open dashboard to review daily/weekly/monthly watch time, channel/category breakdowns, and completion rates.
- Compare Shorts usage metrics (per session count, time per run, binge depth) to long-form viewing.
- Inspect hour-of-day heatmaps to spot peak distraction windows.

Goal setting & AI guidance
- Define limits (e.g., “<45 min Shorts per day”, “Reduce entertainment channels by 30%”).
- Review AI-generated suggestions and forecasts based on recent trends.
- Receive nudges, alternative recommendations, or celebratory feedback when goals are met or missed.

### 5. Feature Scope (MVP unless noted)
- Google Takeout ingestion of YouTube watch history (CSV/JSON) with secure storage and user-controlled deletion.

Analytics dashboards
- Daily/weekly/monthly total watch time, video count, and session count.
- Hour-of-day distributions for each time horizon (per-day view plus averaged weekly/monthly day profiles).
- Watch-time vs. video-length completion ratio charts for long-form and Shorts content.
- Channel, category, and keyword pie charts with drill-down details.
- Longest-session, streak, and binge-detection callouts.

Shorts analytics
- Daily/weekly/monthly averages of Shorts minutes watched.
- Average Shorts viewed per app visit; average consecutive Shorts binge duration.
- Comparison between Shorts and long-form consumption patterns.

Goal management & AI guidance
- Configurable consumption limits by content type, category, channel, or time-of-day.
- AI assistant to interpret trends, suggest reduction tactics, and propose replacement activities.
- Weekly digest summarizing progress toward goals.

Notifications & reminders
- Optional push/email reminders when approaching limits or peak binge hours.
- Positive reinforcement for improvement streaks.

Privacy controls
- Explicit consent management, in-app data deletion, and privacy-first language.

Future / stretch scope
- Social comparisons, community challenges, or gamified achievements.
- Real-time YouTube API syncing (outside Takeout) once privacy/legal requirements are met.
- Family plans with aggregated insights across accounts.

### 6. UX Principles
- Clean dashboard layout with floating cards and prominent headline metrics for each time horizon.
- Consistent color palette, iconography, and typography; responsive design for mobile-first.
- Charts with tooltips, legends, and contextual explanations to simplify interpretation.
- Clear stepper for Takeout import and progress states (queued → processing → ready).
- Accessible design (keyboard navigation, contrast compliance, alternative text) mandated.

### 7. Content & Messaging
- Tone: supportive, empathetic, data-driven.
- Surfacing insights: highlight most actionable information first (e.g., “Peak binge window: 9-11 PM”).
- AI guidance phrased as suggestions, not prescriptions; allow users to adjust sensitivity.

### 8. Dependencies & Constraints
- Requires users to request Google Takeout export (processing delays must be communicated).
- Works with Databutton stack: React + TypeScript frontend, FastAPI backend, Firestore, and Firebase Auth.
- Must respect GDPR/CCPA for data handling.
- AI features rely on OpenAI access via Databutton secrets vault.

### 9. Milestones
- Sprint 1 – Onboarding flow, Takeout upload parser, raw data ingestion.
- Sprint 2 – Daily/weekly/monthly analytics, heatmaps, completion ratios.
- Sprint 3 – Shorts analytics, pie charts, notifications.
- Sprint 4 – Goal settings, AI guidance, summary digests.
- Sprint 5 – Polish, accessibility, performance optimizations, soft launch.

### 10. Risks & Mitigations
- Takeout delay: provide email/push notification when data ready; pre-populate sample data.
- Parsing variability: support multiple Takeout formats with validation pipeline; offer fallback manual upload.
- Privacy concerns: transparent communication, easy deletion, encryption at rest, anonymized analytics.
- AI overreach: keep suggestions explainable; allow opt-out.

---

## Technical Requirements Document (TRD)

### 1. System Architecture
- Frontend: React + TypeScript app in Databutton workspace (Vite) with Zustand state management, Tailwind/shadcn UI, and Brain client for API calls.
- Backend: FastAPI modular services under `src/app/apis/<api_name>/__init__.py` with Pydantic models and async endpoints.
- Data store: Firestore for structured analytics data; Databutton storage for raw uploads when needed.
- Auth: Firebase Auth for Google sign-in; enforce user-guarded routes per Databutton guidelines.
- AI services: OpenAI gpt-4o-mini invoked through Databutton secrets API for insight generation.
- Deployment: Databutton-managed with hot reload; no manual FastAPI instantiation beyond specified pattern.

### 2. Data Ingestion Pipeline
Upload handling
- Frontend: guided upload (drag/drop + instructions) → Brain API call to initiate processing.
- Backend endpoint `/youtube/import_takeout`: validate user auth, store original file temporarily (encrypted), queue parsing job.

Parsing service
- Extract YouTube watch history entries (JSON or CSV). Map to internal schema:
  - `videoId`, `title`, `channelName`, `channelId`, `category`, `keywords`, `watchTime`, `startTimestamp`, `duration`, `sourceType` (recommendation algorithm/intent), `isShort`.
- Normalize time zones to user preference.
- Derive `completionRate = watchTime / duration` (cap at 100%).
- Persist raw events in Firestore `watch_sessions` collection (batched writes) and aggregated caches when feasible.

Aggregation jobs
- Triggered on import completion and nightly cron.
- Compute:
  - Daily/weekly/monthly totals and moving averages.
  - Hour-of-day histograms per day/week/month (bucketed by hour).
  - Channel/category/keyword counts and watch time.
  - Shorts metrics (per visit counts, binge sequences).
- Store aggregated documents in `analytics` collection keyed by user + period; maintain metadata for last processed timestamp.

Goal evaluation
- Monitor actuals vs. user goals; produce streak records and near-limit alerts.

### 3. Backend Services
Modules
- `auth` utilities for token verification (Firebase).
- `importer` for file ingestion/parsing.
- `analytics` for computation and caching.
- `goals` for CRUD and evaluation.
- `ai_insights` for prompt construction and caching.

Endpoints (Brain client generated names)
- `youtube_import_takeout` (POST) – upload metadata, returns processing status.
- `youtube_sync_watch_history` (POST) – optional incremental sync for direct API (future).
- `get_sync_status` (GET) – polling for import completion.
- `get_analytics` (GET) – returns aggregated data per period, with toggles for heatmaps/pie charts.
- `get_user_summary` (GET) – combine long-form + Shorts metrics with AI summary.
- Goals endpoints – create/update/delete goals, fetch status.
- `ai_guidance` (POST) – request latest insights for dashboards.

Processing
- Use background tasks or job queue (Databutton worker) for heavy parsing/aggregation to avoid blocking request threads.
- Implement idempotency by storing last processed Takeout file hash.

### 4. Frontend Application Structure
Pages
- `/onboarding` – Stepper guiding through Takeout instructions and upload.
- `/dashboard` – default analytics view with toggle tabs for day/week/month and long-form vs Shorts.
- `/goals` – management of time limits and target reductions.
- `/insights` – AI summary feed and recommendations.
- `/settings` – privacy, notification preferences, data export/delete.

Components
- `TimeSummaryCard`, `WatchHeatmap`, `CompletionRatioChart`, `PieChartPanel`, `ShortsSessionCard`, `GoalProgressCard`.
- `UploadProgressModal`, `AIRecommendationList`, `StreakBadge`.

State
- Zustand stores for user profile, analytics data (normalized by period), goals, AI insights.
- Derived selectors for computed metrics (e.g., average Shorts per visit).

UX behaviors
- Skeleton loaders and toasts (sonner) for async states.
- Responsive layouts using Tailwind grid; dark-mode styling per conventions.

### 5. AI Guidance Engine
Input: aggregated metrics (e.g., weekly heatmap peaks, most-watched categories), goal statuses, and recent changes.

Prompt template includes:
- Summary of recent consumption.
- Goals plus progress deltas.
- Constraints (tone, actionable suggestions, optional replacements).

Output sanitized; store last AI response to avoid repeated calls (cache TTL). Provide explanation metadata for UI (confidence, data sources). Use OpenAI client as defined in AGENTS (with secrets vault).

### 6. Goal & Notification Logic
- Goals stored with thresholds (duration, percentage reduction, channel/category filters, time windows).
- Evaluate during daily aggregation; record `currentValue`, `targetValue`, `trend`.
- Notification service triggers:
  - When user is projected to exceed daily limit (based on historic hourly pace).
  - At streak milestones (3/7/14 days meeting goals).
- Provide API for toggling reminders and selecting channels (push/email/in-app).

### 7. Security & Privacy
- Enforce Firebase Auth tokens on all backend endpoints; implement per-user Firestore rules.
- Store OAuth tokens and uploaded files server-side only, encrypted; purge raw Takeout files after processing.
- Provide data deletion endpoint to remove raw and aggregated data.
- Never expose API keys to frontend; access OpenAI only from backend.

### 8. Performance & Scalability
- Batched Firestore writes (≤500 per batch); chunking for large histories.
- Use aggregated caches to reduce compute on dashboards.
- Lazy-load charts and use Suspense for heavy components.
- Monitor Firestore and API quotas; implement exponential backoff for retries.

### 9. Testing & QA
- Unit tests: parsing logic, aggregation functions, goal evaluation.
- Integration tests: upload → processing → analytics retrieval using synthetic datasets.
- Frontend tests: component rendering, state transitions, accessibility (axe), responsive snapshots.
- Manual QA checklist per AGENTS (auth flow, sync, analytics updates, dark theme, accessibility, mobile responsiveness).

### 10. Monitoring & Analytics
- Instrument key events (`sync_completed`, `goal_met`, `ai_suggestion_viewed`) via analytics tracker for growth insights.
- Log backend errors; capture performance metrics for ingestion pipeline.
- Provide admin dashboard for support (aggregate only, anonymized).

### 11. Rollout Strategy
- Beta launch with limited cohort; monitor ingestion success and AI feedback relevancy.
- Iterate on prompt templates and goal recommendations based on user satisfaction metrics.
- Scale marketing once ingestion success rate >90% and retention metrics meet targets.

---

## Notes
- This is a living document. Keep PRD/TRD aligned with implementation details and update milestones, risks, and success metrics as we learn.
- See root `AGENTS.md` for platform, conventions, and additional guardrails that govern this codebase.

