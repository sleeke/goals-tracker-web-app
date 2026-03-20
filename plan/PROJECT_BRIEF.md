# Goal Tracker Web App - Project Brief

## Project Overview

A cross-platform Progressive Web App (PWA) for tracking daily, weekly, and monthly goals with offline-first capabilities. Users can manage goals across desktop and mobile devices with real-time synchronization via Firebase, retroactive progress logging, and revert functionality for accidental entries.

## Business Requirements

### Core Features

#### 1. Goal Management
- **Create Goals**: Users can add new goals with configurable tracking frequency (daily, weekly, monthly)
- **Edit Goals**: Modify goal details, descriptions, and tracking frequency
- **Delete Goals**: Remove goals from the system
- **Goal Categories**: Organize goals by custom categories for better organization
- **Goal Status**: Mark goals as active, archived, or completed for the year

#### 2. Progress Tracking
- **Log Progress**: Record progress for active goals with timestamps
- **Current Period Display**: Show progress metrics for the current active period (day/week/month)
- **Yearly Progress**: Display cumulative progress toward yearly targets
- **Progress History**: View all historical progress entries for audit and retroactive modifications
- **Visual Indicators**: Progress bars, percentages, and status badges for quick visual feedback

#### 3. Retroactive Logging
- **Custom Timestamps**: Add progress entries with custom dates/times for past periods
- **Batch Entry**: Add multiple progress entries at once for previous periods
- **Period Navigation**: Easy selection of past weeks/months to add retroactive progress
- **Validation**: Prevent invalid entries (e.g., logging progress after goal's completion date)

#### 4. Progress Reversion
- **Undo Recent Changes**: Revert the last progress entry for a goal
- **Audit Trail**: View complete history of all progress changes with timestamps
- **Selective Deletion**: Remove specific progress entries from history
- **Conflict Resolution**: Handle simultaneous edits across devices (last-write-wins strategy)

#### 5. Reporting & Analytics
- **Period Summary**: Weekly/monthly progress summaries with completion rates
- **Year-to-Date Dashboard**: Overview of all goals' yearly progress
- **Trends**: Visualize progress trends over time
- **Streak Tracking**: Display consecutive days/weeks of progress for daily/weekly goals
- **Export**: Export progress data as CSV/PDF for external analysis

## Technical Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 7.3.0
- **Styling**: CSS-in-JS or CSS Modules (to be decided)
- **State Management**: Redux Toolkit or React Context API (to be decided)
- **PWA**: vite-plugin-pwa with service workers for offline-first caching

### Backend & Data
- **Database**: Firebase Firestore for cloud data persistence
- **Authentication**: Firebase Auth (Email/Password, Google, Apple sign-in)
- **Real-time Sync**: Firebase Realtime Database listeners for cross-device sync
- **Offline Storage**: IndexedDB for local-first data with automatic Firestore sync

### Testing & Quality
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright with browser testing for web and mobile
- **BDD**: Cucumber/Gherkin feature files for acceptance testing
- **Code Quality**: ESLint + Prettier for consistent code style
- **CI/CD**: Ready for GitHub Actions integration

## Architecture Overview

### Offline-First Strategy
1. All data reads/writes go to local IndexedDB first
2. Service workers cache HTTP requests and UI assets
3. Background sync queue stores failed mutations
4. When online, Firestore syncs with local data (last-write-wins conflict resolution)
5. User always has current UI regardless of connection state

### Authentication Flow
1. Firebase Auth handles sign-up/login with email, Google, or Apple
2. User credentials stored securely in browser's credential manager
3. Authenticated requests to Firestore with row-level security rules
4. Sign-out clears local data and service worker cache

### Data Synchronization
- Real-time Firestore listeners update local IndexedDB on changes
- Optimistic updates on UI during offline mode
- Background sync retries failed operations when connection restored
- Conflict resolution via timestamp-based last-write-wins strategy

## Project Structure

```
goal-tracker-web-app/
├── src/
│   ├── components/         # React components (Goal, Progress, Dashboard, etc.)
│   ├── pages/              # Page components (Home, Goals, Analytics, Settings)
│   ├── services/           # Business logic (Firebase, goal calculations, sync)
│   ├── store/              # Redux store or Context API setup
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces and types
│   ├── utils/              # Utility functions (date handling, validation, etc.)
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css            # Global styles
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons for PWA install
├── features/               # Cucumber/Gherkin BDD feature files
├── plan/                   # Planning documents (roadmap, backlog, bugs)
│   ├── PROJECT_BRIEF.md    # This file
│   ├── DATA_MODEL.md       # Firestore schema and offline storage
│   └── ARCHITECTURE.md     # Detailed technical architecture
├── BACKLOG.md              # Future features and enhancements
├── vite.config.ts          # Vite configuration with PWA plugin
├── vitest.config.ts        # Vitest configuration
├── playwright.config.ts    # Playwright E2E testing configuration
├── cucumber.js             # Cucumber configuration
├── .env.example            # Firebase credentials template
├── package.json            # Dependencies and scripts
└── README.md               # Getting started guide

```

## Key Decisions

### Authentication Strategy
- **Multi-provider Auth**: Email + Google + Apple sign-in for flexibility
- **No Anonymous Users**: All features require authentication for data privacy

### Offline-First Synchronization
- **Last-Write-Wins**: In case of device conflicts, timestamp-based resolution
- **Optimistic UI Updates**: User sees changes immediately, sync happens in background
- **Automatic Retry**: Failed sync operations retry when connection returns

### Data Conflict Resolution
- If user updates goal on Device A offline, then on Device B online, Device B's changes (newer timestamp) win
- User is notified of conflicts and can manually reconcile if needed

### Testing Strategy
- **BDD First**: Write Cucumber features for all user-facing functionality
- **Unit Tests**: Jest/Vitest for service layer and utilities
- **E2E Tests**: Playwright for critical user journeys on desktop and mobile browsers
- **No E2E for Native**: Mobile testing via browser, not native apps

## MVP Scope (Phase 1)

- ✅ Goal CRUD (create, read, update, delete)
- ✅ Daily goal tracking only (weekly/monthly in Phase 2)
- ✅ Current period progress display
- ✅ Basic progress logging
- ✅ Yearly progress summary
- ✅ Firebase Auth (Email + Google)
- ✅ Offline-first sync with Firestore
- ✅ PWA installable on desktop and mobile
- ⏳ Basic revert (last entry only)
- ⏳ Simple BDD tests for critical paths

## Phase 2 Enhancements

- Weekly and monthly goal tracking
- Retroactive logging with custom timestamps
- Complete audit trail and selective deletion
- Advanced revert with full history
- Progress trends and streak tracking
- CSV export functionality
- Apple sign-in authentication
- Enhanced error handling and user notifications

## Phase 3+ (Future)

- Goal templates library
- Sharing and collaboration (multi-user goals)
- Notifications and reminders
- Mobile native apps (React Native)
- AI-powered insights and goal recommendations
- Integration with calendar/health tracking apps

## Success Criteria

1. **Functionality**: All MVP features working correctly per BDD specifications
2. **Performance**: App loads in <2 seconds on 4G, offline-first operations instant
3. **Reliability**: 99%+ sync success rate, graceful handling of network errors
4. **UX**: Intuitive goal creation, clear progress visualization, mobile responsive
5. **Code Quality**: All critical paths covered by BDD + unit tests, ESLint clean
6. **Accessibility**: WCAG 2.1 AA compliance for inclusive design

## Development Workflow

1. Write BDD feature file for new functionality
2. Implement service/domain logic with unit tests
3. Build React components with component tests
4. E2E test with Playwright
5. Code review and merge to main branch
6. Deploy to Firebase Hosting with CI/CD

## Deployment

- **Hosting**: Firebase Hosting for PWA distribution
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Environments**: Development (localhost), Staging (Firebase preview), Production

---

**Last Updated**: January 4, 2026  
**Status**: Planning Complete - Ready for Implementation
