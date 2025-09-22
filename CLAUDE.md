# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "ViewTime" (Y-Stats), a YouTube analytics application that helps users analyze their viewing habits. The project is built for the Databutton platform but can also be run locally with Docker.

## Architecture

**Full-stack application with:**
- **Frontend**: React + TypeScript with Vite, using shadcn/ui components and Tailwind CSS
- **Backend**: FastAPI with Python 3.13+ and `uv` package manager
- **Database**: Firestore (Firebase)
- **Authentication**: Firebase Auth with Google OAuth
- **Deployment**: Databutton platform (production) or Docker (local)

**Project Structure:**
```
view-time (5)/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route-based pages
│   │   ├── utils/        # Helper functions
│   │   ├── brain/        # Generated backend client
│   │   └── app/auth/     # Authentication logic
│   └── package.json
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── apis/         # API route modules
│   │   ├── auth/         # Authentication utilities
│   │   └── libs/         # Business logic libraries
│   ├── main.py           # FastAPI application entry
│   └── pyproject.toml
├── docker-compose.yml    # Production-like container
├── docker-compose.dev.yml # Development with hot-reload
└── Makefile             # Build and run commands
```

## Development Commands

### Quick Start
```bash
# Install all dependencies
make

# Run backend and frontend separately (recommended for development)
make run-backend  # Starts FastAPI with uvicorn --reload on port 8000
make run-frontend # Starts Vite dev server on port 5173

# Docker development environment (alternative)
make dev          # Hot-reload for both frontend and backend
```

### Individual Components
```bash
# Backend only
cd backend && ./run.sh  # Activates venv and runs uvicorn main:app --reload

# Frontend only  
cd frontend && ./run.sh # Runs yarn dev
```

### Docker Workflows
```bash
# Production-like container
docker compose up --build  # Nginx serves frontend + proxies API (port 8080)

# Development with hot-reload
docker compose -f docker-compose.dev.yml up --build
```

### Frontend Development
```bash
cd frontend
yarn dev        # Start development server
yarn build      # Build for production
yarn lint       # Run ESLint
```

## Key Technologies & Patterns

### Frontend
- **State Management**: Zustand stores with Firebase real-time subscriptions
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support
- **Charts**: Recharts for analytics visualizations
- **Authentication**: Firebase Auth with `useCurrentUser` and `UserGuard` components
- **API Client**: Generated TypeScript client in `src/brain/` (do not modify manually)

### Backend
- **API Structure**: FastAPI routers in `app/apis/<module>/__init__.py`
- **Models**: Pydantic models for request/response validation
- **Authentication**: Firebase Admin SDK for token verification
- **Data Processing**: Specialized libraries in `app/libs/` for YouTube data processing
- **Storage**: Firestore for real-time data, server storage for temporary files

### Authentication Flow
- Google OAuth via Firebase Auth
- Protected routes use `UserGuard` component
- Backend validates Firebase tokens for API access
- User data stored in Firestore collections

## Core Features

### YouTube Data Integration
- OAuth scope: `https://www.googleapis.com/auth/youtube.readonly`
- Sync watch history and liked videos
- Process and analyze viewing patterns
- Generate insights and recommendations

### Analytics Dashboard
- Daily/weekly/monthly usage charts
- Channel and category breakdowns
- Watch time heatmaps
- Session analysis and completion rates
- Repeat viewing detection
- Algorithmic vs intentional viewing analysis

## Important Conventions

### API Development
- All endpoints in `backend/app/apis/<module>/__init__.py`
- Use Pydantic models for validation
- Handle authentication via Firebase tokens
- Return consistent JSON responses

### Frontend Development
- Components use TypeScript with Props interfaces
- API calls through generated brain client: `import brain from "brain"`
- Use sonner for toast notifications
- Follow shadcn/ui patterns for consistent styling
- Implement loading states and error handling

### Database
- Firestore collections for user data and analytics
- Use Firebase real-time listeners for live updates
- Sanitize keys to `[a-zA-Z0-9._-]` for storage compatibility

## Environment Setup

### Required Environment Variables
```bash
# Backend (.env or docker environment)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YOUTUBE_API_KEY=
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

### Ports
- Frontend dev server: 5173 (proxies API to 8000)
- Backend API: 8000
- Docker Nginx: 8080 (combined frontend + API)

## Testing & Quality

### Manual Testing Checklist
- Authentication flow (Google sign-in → redirect → logout)
- YouTube data sync and status polling
- Analytics charts rendering with real data
- Dark mode theme switching
- Mobile responsive design
- Error handling and loading states

### Common Issues
- Ensure Firebase app is properly initialized (don't create duplicate apps)
- Use generated brain client instead of direct fetch calls
- Check that environment variables are properly loaded
- Verify Firestore security rules for data access

## Deployment

### Local Development
1. Run `make` to install dependencies
2. Use `make run-backend` and `make run-frontend` for development
3. Access application at http://localhost:5173

### Docker Production
1. Copy `.env.docker.example` to `.env.docker` and fill in values
2. Run `docker compose up --build`
3. Access application at http://localhost:8080

### Databutton Platform
- Deploy directly from Databutton workspace UI
- Environment variables managed through platform secrets
- Automatic deployment pipeline with workspace preview