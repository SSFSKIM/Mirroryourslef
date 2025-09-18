# AGENTS.md - ViewTime (Y-Stats) YouTube Analytics App

## Mission Statement
Build a YouTube usage analytics app that maximizes user growth and feature richness while maintaining privacy-first principles and delivering actionable insights to users about their viewing habits.

## Primary Objectives
- **Maximize user acquisition and retention** through engaging features and gamification
- **Expand app functionality** based on user needs and analytics data
- **Provide actionable insights** from YouTube usage patterns
- **Ensure smooth data collection** with privacy compliance (GDPR/CCPA)

## Platform & Environment

### Development Platform
- **Platform**: Databutton (React + TypeScript frontend, FastAPI backend)
- **Dev Environment**: Hot-reload for UI and API in workspace preview
- **Production**: Deploy from Databutton UI only when features are stable
- **Database**: Firestore (direct access from UI preferred)
- **Authentication**: Firebase Auth (use provided firebaseApp and firebaseAuth)

### Setup Commands
```bash
# Frontend (local optional)
cd ui
npm install
npm run dev

# Backend - DO NOT create FastAPI app or run uvicorn
# Only add API files under src/app/apis/<api_name>/__init__.py

# Python dependencies
# Add to src/requirements.txt (platform installs automatically)
```

## Architecture & Code Organization

### Frontend Structure
```
ui/src/
├── pages/          # Auto-routed pages (no BrowserRouter)
├── components/     # Reusable UI components with Props interface
├── stores/         # Zustand stores for state management
├── utils/          # Helper functions and utilities
├── hooks/          # Custom React hooks
└── brain/          # Generated backend client
```

### Backend Structure
```
src/app/apis/
├── <api_name>/
│   └── __init__.py  # router = APIRouter()
└── requirements.txt  # Python dependencies
```

## Core Features Implementation

### Phase 1: MVP Features
1. **YouTube Data Collection**
   - OAuth scope: `https://www.googleapis.com/auth/youtube.readonly`
   - Sync watch history: `youtube_sync_watch_history`
   - Sync liked videos: `sync_liked_videos`
   - Poll sync status: `get_sync_status`

2. **Analytics Dashboard**
   - Daily/weekly/monthly usage charts
   - Most watched channels and categories
   - Watch time heatmap
   - Video completion rates
   - Liked videos analytics

3. **User Authentication**
   - Google Sign-in (Firebase Auth)
   - Protected pages using `useUserGuardContext`
   - Open pages using `useCurrentUser`

### Phase 2: Growth Features
1. **Gamification System**
   - Usage goals and achievements
   - Watching streaks tracking
   - Comparison with anonymized averages
   - Progress badges and rewards

2. **AI-Powered Insights**
   - OpenAI integration: `gpt-4o-mini` via `db.secrets.get("OPENAI_API_KEY")`
   - Viewing pattern analysis
   - Personalized recommendations
   - Content quality scoring

3. **Social & Sharing**
   - Shareable statistics cards
   - Friend comparisons (privacy-first)
   - Community challenges
   - Referral tracking system

## Technical Requirements

### Frontend Conventions
```typescript
// Component naming: PascalCase
export const DashboardChart: React.FC<Props> = () => {}

// State management: Zustand with onSnapshot
const useYouTubeStore = create((set) => ({
  watchHistory: [],
  syncStatus: 'idle'
}))

// API calls: Always use brain client
import brain from "brain"
const response = await brain.youtube_sync_watch_history()

// Styling: Tailwind + shadcn
<Card className="dark:bg-gray-900 p-4 rounded-lg shadow-xl">
  <CardContent>...</CardContent>
</Card>

// Toasts: Use sonner
import { toast } from "sonner"
toast.success("Sync completed!")
```

### Backend Conventions
```python
# API structure
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SyncRequest(BaseModel):
    user_id: str
    force_refresh: Optional[bool] = False

@router.post("/sync")
async def sync_watch_history(request: SyncRequest):
    # Implementation
    return {"status": "success"}

# OpenAI usage
from openai import OpenAI
client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...]
)

# Storage (sanitize keys to [a-zA-Z0-9._-])
import db
data = db.storage.get(f"user_{user_id}_analytics")
```

### Database Schema
```typescript
// Firestore collections
interface User {
  uid: string
  email: string
  createdAt: Timestamp
  preferences: {
    theme: 'dark' | 'light'
    notifications: boolean
    privacy: 'public' | 'friends' | 'private'
  }
  subscription: 'free' | 'pro' | 'premium'
}

interface WatchSession {
  userId: string
  videoId: string
  videoTitle: string
  channelName: string
  duration: number
  watchedAt: Timestamp
  category: string
  completionRate: number
}

interface Analytics {
  userId: string
  period: 'daily' | 'weekly' | 'monthly'
  totalWatchTime: number
  videoCount: number
  topChannels: Array<{name: string, time: number}>
  peakHours: Record<number, number>
  updatedAt: Timestamp
}
```

## Security & Privacy

### Critical Security Rules
- **NEVER expose secrets in frontend** - Use backend only for sensitive operations
- **OAuth tokens**: Store securely, never pass to frontend
- **API keys**: Access via `db.secrets` in backend only
- **User data**: Encrypt sensitive information, implement data deletion
- **Rate limiting**: Implement on all public endpoints
- **Input validation**: Use Pydantic models, sanitize all inputs

### Privacy Compliance
- GDPR/CCPA data export functionality
- Clear data deletion policy and implementation
- Consent management for data collection
- Anonymous analytics option for privacy-conscious users

## User Growth Implementation

### Onboarding Flow
1. **Welcome Screen** - Value proposition clear in 10 seconds
2. **Quick Setup** - OAuth in 2 clicks
3. **First Insight** - Show immediate value (today's watch time)
4. **Tutorial** - Interactive guide to key features
5. **Goal Setting** - Personal targets for engagement

### Engagement Mechanics
```typescript
// Streak tracking
const checkStreak = async (userId: string) => {
  const lastActive = await getLastActiveDate(userId)
  const streak = calculateStreak(lastActive)
  if (streak > 0 && streak % 7 === 0) {
    await unlockAchievement(userId, `week_${streak/7}_streak`)
    toast.success(`🔥 ${streak} day streak!`)
  }
}

// Gamification points
const awardPoints = (action: string, userId: string) => {
  const points = {
    'daily_check': 10,
    'weekly_report_viewed': 25,
    'goal_achieved': 50,
    'friend_referred': 100
  }
  updateUserPoints(userId, points[action])
}
```

## Performance Optimization

### Frontend Performance
- Lazy load components: `React.lazy(() => import('./HeavyChart'))`
- Memoize expensive calculations: `useMemo(() => calculateStats(data), [data])`
- Virtual scrolling for long lists: `react-window`
- Optimize images: Next/Image or lazy loading
- Bundle splitting by route

### Backend Performance
- Cache frequently accessed data in `db.storage`
- Batch Firestore operations
- Implement pagination for large datasets
- Use indexes for frequent queries
- Background jobs for heavy processing

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] **Auth Flow**: Google sign-in → Protected redirect → Logout
- [ ] **YouTube Sync**: Trigger sync → Poll status → Verify data
- [ ] **Analytics**: Charts render → Data updates → Responsive layout
- [ ] **Dark Theme**: All components properly styled
- [ ] **Accessibility**: Keyboard navigation, screen reader support
- [ ] **Mobile**: Responsive on all breakpoints

### Common Pitfalls to Avoid
- ❌ DO NOT initialize another Firebase app
- ❌ DO NOT use path params in router (use query params)
- ❌ DO NOT import logging module (use print)
- ❌ DO NOT use fetch for internal APIs (use brain client)
- ❌ DO NOT expose secrets in frontend
- ❌ DO NOT modify auto-generated router

## Available Backend Endpoints
```python
# Health & Status
check_health()
get_sync_status()
get_analytics_status()

# YouTube Sync
youtube_sync_watch_history()
sync_liked_videos()
get_sync_status_endpoint()
sync_watch_history_endpoint()

# Analytics
get_analytics()
get_user_summary()

# Always verify parameter names in ui/src/brain
```

## Deployment Checklist

### Pre-deployment
- [ ] All manual tests passing
- [ ] No console errors
- [ ] Secrets configured in db.secrets
- [ ] API endpoints documented
- [ ] Rate limiting enabled
- [ ] Error tracking configured

### Post-deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Test critical user flows
- [ ] Monitor user feedback

## Definition of Done

### Per Feature
✅ **UI**: Accessible, responsive, dark-theme compatible, no console errors  
✅ **API**: Pydantic models, validated inputs, callable via brain client  
✅ **Data**: Firestore integrated, real-time updates via onSnapshot  
✅ **Security**: No exposed secrets, input sanitization, rate limiting  
✅ **UX**: Loading states, error handling, success feedback via toasts  
✅ **Growth**: Analytics events tracked, engagement mechanics implemented  
✅ **Docs**: AGENTS.md updated, inline comments for complex logic

## Monitoring & Analytics

### Track Key Metrics
- User acquisition rate
- Daily/Weekly/Monthly Active Users
- Feature adoption rates
- User retention (D1, D7, D30)
- Sync completion rates
- Error rates by feature

### Implementation
```typescript
// Track events
const trackEvent = (event: string, properties?: any) => {
  // Google Analytics or Mixpanel
  gtag('event', event, properties)
  
  // Internal analytics
  logUserAction(event, properties)
}

// Usage
trackEvent('sync_completed', { duration: syncTime })
trackEvent('feature_used', { feature: 'weekly_report' })
```

## Commit Conventions
```bash
feat: Add weekly report generation
fix: Resolve sync status polling issue
chore: Update dependencies
refactor: Optimize analytics calculation
docs: Update AGENTS.md with new endpoints
style: Improve dark mode contrast
perf: Lazy load heavy components
test: Add sync flow validation
```

## Resources & Documentation
- Databutton Docs: Platform-specific guidance
- YouTube API: https://developers.google.com/youtube/v3
- Firebase Auth: https://firebase.google.com/docs/auth
- Firestore: https://firebase.google.com/docs/firestore
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs

## Important Notes for AI Agents
1. **Always prioritize user value** - Every feature should solve a real problem
2. **Privacy-first approach** - User trust is paramount
3. **Performance matters** - Slow apps lose users
4. **Mobile-first design** - Most users will access via mobile
5. **Iterate based on data** - Use analytics to guide development
6. **Accessibility is non-negotiable** - WCAG 2.1 AA compliance
7. **Code quality affects growth** - Technical debt slows feature development
8. **Documentation saves time** - Clear code and comments reduce debugging