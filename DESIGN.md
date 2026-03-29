# Design System — MirrorYourself

## Product Context
- **What this is:** Privacy-first YouTube analytics that helps users understand their viewing habits through liked-video sync and watch-history Takeout upload
- **Who it's for:** Privacy-conscious YouTube users who want self-awareness about their viewing patterns without giving data to third parties
- **Space/industry:** Personal analytics / digital wellbeing (peers: Oura, RescueTime, Screen Time). NOT creator growth tools (VidIQ, Viewstats)
- **Project type:** Web app — dashboard with data visualizations, landing page, auth flow

## Aesthetic Direction
- **Direction:** Gallery-Tech Hybrid — the restraint of a well-curated exhibition with the precision of a data tool
- **Decoration level:** Intentional — grain texture overlay, subtle warm atmospheric glows, no decorative blobs or colored circles
- **Mood:** Warm, contemplative, confident. Like looking into a well-lit mirror in a quiet room. Not clinical, not playful, not corporate. Personal.
- **Reference sites:** Linear (dark-mode restraint), Oura (warm premium feel), Monkeytype (warm-dark cult aesthetic)

## Typography
- **Display/Hero:** Syne (700, 800) — geometric, distinctive, tech-flavored but not cold. Used only for h1/h2 headings and brand moments. Never at body size.
- **Body:** Instrument Sans (400, 500, 600, 700) — clean and contemporary with warmth. Replaces Outfit. Excellent at small sizes for dashboard labels and at body sizes for explanations.
- **UI/Labels:** Instrument Sans 500 — the medium weight provides subtle emphasis without shouting.
- **Data/Tables:** JetBrains Mono (400, 500, 700) — `font-variant-numeric: tabular-nums`. Used for all numbers, metrics, stat values, table data, and code. Never for headings or labels.
- **Findings/Nudges:** Instrument Serif Italic — used exclusively for behavioral nudges and insight pull-quotes. Reads as journal entry, not notification. Never used for regular body text.
- **Code:** JetBrains Mono
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  ```
- **Scale:**
  - Hero: clamp(40px, 6vw, 72px) / Syne 800
  - H1: clamp(28px, 4vw, 40px) / Syne 700
  - H2: 24px / Syne 700
  - H3: 18px / Instrument Sans 600
  - Body: 16-17px / Instrument Sans 400
  - Body small: 14px / Instrument Sans 400
  - Label: 13px / Instrument Sans 500
  - Caption: 12px / Instrument Sans 400
  - Data large: 32px / JetBrains Mono 700
  - Data body: 14px / JetBrains Mono 400
  - Data small: 11-12px / JetBrains Mono 400
  - Section label: 11px / JetBrains Mono 400 uppercase, letter-spacing 0.1em
  - Finding: 19px / Instrument Serif Italic

## Color
- **Approach:** Restrained warm — teal primary for action and data, copper for editorial warmth, warm neutrals
- **Warm dark backgrounds** instead of cold blue-black. This is the key differentiator from VidIQ/SaaS tools. The brown undertone signals introspection and intimacy.

### Dark Mode (default)
| Token              | Value     | Usage                                         |
|--------------------|-----------|-----------------------------------------------|
| `--background`     | `#0C0A09` | Page background (warm near-black)             |
| `--surface`        | `#161412` | Card backgrounds                              |
| `--surface-raised` | `#1E1B18` | Hover states, active selections, popover bg   |
| `--primary`        | `#3DD8B8` | Buttons, links, active states, chart accent   |
| `--primary-dim`    | `rgba(61,216,184,0.12)` | Primary tinted backgrounds        |
| `--accent`         | `#C4956A` | Copper — nudge text, secondary chart color, editorial highlights |
| `--accent-dim`     | `rgba(196,149,106,0.12)` | Accent tinted backgrounds        |
| `--text`           | `#EDEBE8` | Primary text (warm off-white, never pure #fff) |
| `--text-muted`     | `#7A756E` | Secondary text, labels, placeholders          |
| `--border`         | `#1E1B18` | Card borders, dividers                        |
| `--destructive`    | `#E54D2E` | Delete, error states                          |
| `--success`        | `#46A758` | Completion, positive metrics                  |
| `--warning`        | `#F5A623` | Processing, caution states                    |
| `--info`           | `#3DD8B8` | Informational (shares primary)                |

### Light Mode
| Token              | Value     | Usage                                         |
|--------------------|-----------|-----------------------------------------------|
| `--background`     | `#F5F3F0` | Page background (warm off-white)              |
| `--surface`        | `#FFFFFF` | Card backgrounds                              |
| `--surface-raised` | `#EBE8E4` | Hover states, active selections               |
| `--primary`        | `#1A9E84` | Darkened teal for light backgrounds            |
| `--accent`         | `#A0764D` | Darkened copper for readability                |
| `--text`           | `#1A1816` | Primary text                                  |
| `--text-muted`     | `#7A756E` | Secondary text                                |
| `--border`         | `#E0DCD8` | Card borders, dividers                        |

### Chart Colors
Use primary (teal) as the dominant chart color. Use accent (copper) as the secondary. For multi-series charts:
- Series 1: `#3DD8B8` (teal)
- Series 2: `#C4956A` (copper)
- Series 3: `#7A756E` (muted — use sparingly)
- Heatmap: teal with opacity gradient (0.05 to 0.6)

### Glow Effects
- Primary glow: `rgba(61, 216, 184, 0.06)` — blur 140px, used for atmospheric orbs
- Accent glow: `rgba(196, 149, 106, 0.04)` — blur 140px, used sparingly
- Card hover glow: `0 0 24px rgba(61, 216, 184, 0.06)` — subtle teal on hover

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:**
  - `2xs`: 2px
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px
  - `2xl`: 48px
  - `3xl`: 64px

## Layout
- **Approach:** Hybrid — card grid for dashboard data, editorial full-width for landing page and behavioral nudges
- **Grid:** Dashboard uses auto-fit minmax(220px, 1fr) for stat cards. Two-column for chart+list pairs.
- **Max content width:** 1120px
- **Border radius:**
  - `sm`: 4px (inputs, small elements)
  - `md`: 8px (buttons, alerts)
  - `lg`: 12px (cards, dialogs)
  - `full`: 9999px (avatars, pills, toggles)

### Editorial Nudge Treatment
Behavioral nudges are NOT cards with icons. They are typographic pull-quotes:
```
border-top: 1px solid var(--border)
border-bottom: 1px solid var(--border)
padding: 24px 0
font: Instrument Serif Italic, 19px, line-height 1.6
color: var(--accent) (#C4956A)
```
No lightbulb icon. No card container. No "Insight:" label. Just the sentence between thin rules. Let it land.

## Motion
- **Approach:** Intentional — subtle entrance animations, meaningful state transitions, no bouncy choreography
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Hover lift:** translateY(-1px) over 200ms for interactive cards
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` — collapse all animations to 0.01ms
- **Grain overlay:** Fixed position, opacity 0.03, mix-blend-mode overlay. Adds analog texture without drawing attention.

## Anti-Patterns (never use)
- Purple/violet gradients
- 3-column feature grids with icons in colored circles
- Centered-everything layout with uniform spacing
- Uniform bubbly border-radius on all elements
- Gradient buttons as primary CTA
- Pure white (#FFFFFF) text on dark backgrounds (use #EDEBE8)
- Cold blue-black backgrounds (use warm near-black)
- Decorative blobs or floating shapes (atmospheric glows only, very subtle)
- Using Instrument Serif for anything other than nudges/findings

## Decisions Log
| Date       | Decision                           | Rationale                                                                    |
|------------|------------------------------------|------------------------------------------------------------------------------|
| 2026-03-28 | Initial design system created      | Created by /design-consultation based on competitive research + outside design voices (Codex + Claude subagent) |
| 2026-03-28 | Warm near-black over cold blue-black | Every YouTube/SaaS tool uses cold dark. Warm signals introspection, matches "Mirror" brand identity |
| 2026-03-28 | Keep teal, add copper accent       | Teal is the brand, reads clarity/calm. Copper replaces flat amber for warmth and editorial character |
| 2026-03-28 | Instrument Sans replaces Outfit    | More refined, better small-size rendering, pairs well with Syne without competing |
| 2026-03-28 | Instrument Serif for nudges only   | Creates psychological texture — serif italic between mono sections feels like journal entry, not notification |
| 2026-03-28 | Editorial nudge treatment          | Inspired by data journalism (The Pudding, NYT Graphics). Trust the copy, kill the chrome. |
