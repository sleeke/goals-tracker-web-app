# Backlog - Future Features & Enhancements

This document tracks features and improvements that are not in the current MVP but have been identified for future phases. Items can be added as you think of them.

## How to Use This Backlog

- **New Ideas**: Add items to the appropriate section
- **Prioritization**: Use priority labels (High, Medium, Low)
- **Dependency Notes**: Reference other items if a feature depends on another being completed first
- **Status**: Track whether items are in planning, design, or ready for development

## Backlog template

### Feature Title
- **Description**: A description of the feature
- **Priority**: High/Medium/Low
- **Status**: In planning
- **Dependencies**: Other features which need to be completed first


---

## Phase 1: User Requests

### Recent progress
- **Description**: There should be a slimline visual within the goal card which shows the recent success rate for the goal. It should perhaps be a vertical bar chart showing the last 10 goal periods, with bars indicating the number of progress units, and colors indicating the success/failure of the goal. There should also be a summary showing the percentage of successful goal periods. This can replace the current indicator for progress units so far this year
- **Priority**: Medium
- **Status**: In planning
- **Dependencies**: None

### Shrink completed goals
- **Description**: Goals should minimize to a smaller state at the end of the list once complete. THey should still be re-openable so they can be updated, but should be minimized byu default once complete.
- **Priority**: Medium
- **Status**: In planning
- **Dependencies**: None

## Phase 2: Extended Goal Tracking

### Weekly and Monthly Goals
- **Description**: Extend beyond daily goals to support weekly (reset Monday) and monthly (reset 1st) tracking
- **Priority**: High
- **Status**: In planning
- **Dependencies**: Goal management feature must support frequency selection

### Streak Tracking
- **Description**: Display current and longest streaks for each goal with visual calendar
- **Priority**: High
- **Status**: In planning
- **Acceptance Criteria**:
  - Current streak displays on dashboard
  - Longest streak recorded and shown
  - Visual calendar shows which days/weeks completed
  - Streak resets on missed period

### Goal Reminders & Notifications
- **Description**: Send push notifications to remind users to log progress
- **Priority**: Medium
- **Status**: Not started
- **Details**:
  - Browser notifications for web
  - Customizable reminder times per goal
  - Opt-in/opt-out for each goal
  - Quiet hours setting to prevent night notifications

### Progress Aggregation Dashboard
- **Description**: Show summary of all goals' progress on one screen
- **Priority**: High
- **Status**: In planning
- **Includes**:
  - Quick completion percentage for each goal
  - Color-coded status (on track, behind, exceeded)
  - Swipe between daily/weekly/monthly view

---

## Phase 3: Advanced Analytics & Reporting

### Advanced Trend Analysis
- **Description**: ML-powered insights about user's performance patterns
- **Priority**: Medium
- **Status**: Not started
- **Features**:
  - Best day/time of week for completing goals
  - Predictive suggestions for achievability
  - Seasonal pattern detection
  - Correlation between goals (e.g., "on days you exercise, you read more")

### Goal Templates Library
- **Description**: Pre-built goal templates users can clone
- **Priority**: Medium
- **Status**: Not started
- **Examples**:
  - "Read 30 min daily"
  - "Exercise 3x weekly"
  - "Learn language 20 min daily"
  - "Drink 8 glasses water daily"
  - Community-contributed templates

### Batch Import/Export
- **Description**: Import goals and progress from other tracking tools or spreadsheets
- **Priority**: Low
- **Status**: Not started
- **Formats**:
  - CSV import with mapping UI
  - JSON import/export
  - Integration with other tools (Google Sheets, Notion, etc.)

### PDF Report Generation
- **Description**: Generate professional PDF reports of yearly progress
- **Priority**: Medium
- **Status**: Not started
- **Content**:
  - Summary statistics
  - Charts and graphs
  - Monthly breakdowns
  - Goal-specific analytics

---

## Phase 4: Collaboration & Sharing

### Goal Sharing
- **Description**: Share specific goals with friends or accountability partners
- **Priority**: Low
- **Status**: Not started
- **Features**:
  - Share read-only goal progress
  - Optional comments from accountability partner
  - Private vs. public goal settings

### Group Goals
- **Description**: Create goals with multiple people tracking together
- **Priority**: Low
- **Status**: Not started
- **Examples**:
  - Family fitness challenge
  - Team book club (track books read)
  - Friend support group (meditation streak)

### Social Features
- **Description**: Leaderboards, achievements, badges, motivational messages
- **Priority**: Very Low
- **Status**: Not started
- **Includes**:
  - Badges for milestone achievements (30-day streak, etc.)
  - Optional leaderboards with friends
  - Achievement notifications

---

## Phase 5: Integrations & Mobile

### Health App Integrations
- **Description**: Sync with Apple Health, Google Fit, Fitbit
- **Priority**: Low
- **Status**: Not started
- **Benefit**: Automatic logging of health-related goals (steps, exercise, sleep, etc.)

### Calendar Integration
- **Description**: Display goals and progress on calendar view
- **Priority**: Medium
- **Status**: Not started
- **Features**:
  - Calendar view showing completion/missed days
  - Drag-and-drop to adjust progress
  - Color-coded by goal

### Native Mobile Apps
- **Description**: Build iOS and Android native apps
- **Priority**: Medium (after PWA is mature)
- **Status**: Not started
- **Options**:
  - React Native (cross-platform)
  - Native iOS/Android (Swift, Kotlin)
  - Flutter (if framework change approved)

### Smart Home Integration
- **Description**: Trigger smart home actions on goal completion
- **Priority**: Very Low
- **Status**: Not started
- **Examples**:
  - Play celebration sound/music
  - Send SMS reminder
  - IFTTT integration

---

## Phase 6: AI & Personalization

### AI Goal Suggestions
- **Description**: Machine learning recommendations for new goals based on user's habits
- **Priority**: Low
- **Status**: Not started
- **Example**: "Based on your reading progress, try 'Read 1 book per month'"

### Smart Goal Adjustments
- **Description**: AI suggests goal adjustments if user is consistently overachieving or missing
- **Priority**: Low
- **Status**: Not started
- **Example**: "You've exceeded 'Exercise' 4/4 weeks. Try increasing target from 3 to 4 sessions?"

### Personalized Insights
- **Description**: AI-generated weekly/monthly insights about progress
- **Priority**: Low
- **Status**: Not started
- **Example**: "Great week! You're 20% above average for your exercise goal."

---

## Ongoing: Bug Fixes & Improvements

### Performance Optimization
- **Description**: Improve app load time and responsiveness
- **Priority**: Medium
- **Status**: Ongoing
- **Focus Areas**:
  - Code splitting for faster initial load
  - IndexedDB query optimization
  - Service worker caching strategy review

### Mobile UX Improvements
- **Description**: Enhanced mobile user experience
- **Priority**: High
- **Status**: Ongoing
- **Tasks**:
  - Larger touch targets
  - Swipe gestures for navigation
  - Mobile-specific layouts for forms
  - Haptic feedback on iOS

### Accessibility Enhancements
- **Description**: Improve WCAG 2.1 AA compliance
- **Priority**: Medium
- **Status**: Ongoing
- **Focus Areas**:
  - Keyboard navigation improvements
  - Color contrast audit
  - Screen reader testing
  - Form label optimization

### Offline Sync Reliability
- **Description**: Strengthen offline sync and conflict resolution
- **Priority**: High
- **Status**: Ongoing
- **Tasks**:
  - Improve sync retry logic
  - Better conflict detection and reporting
  - Sync status transparency to user
  - Data integrity checks

### Documentation
- **Description**: Improve project documentation and code comments
- **Priority**: Low
- **Status**: Ongoing
- **Areas**:
  - Architecture documentation
  - Component API docs
  - Firebase schema changes log
  - Testing guide for contributors

---

## Ice Box (Lower Priority Ideas)

- [ ] Dark mode theme toggle
- [ ] Habit scoring system (badges/points)
- [ ] Goal burndown charts
- [ ] Time zone-aware goal periods
- [ ] Multi-language support
- [ ] Voice input for logging progress
- [ ] Wearable app integration (Apple Watch)
- [ ] Desktop app using Electron
- [ ] Slack/Discord bot for progress updates
- [ ] Email digest of weekly progress
- [ ] VR/AR future enhancement exploration

---

## Decision Points

### Authentication Extensions
- [ ] Should we add OAuth for Facebook, Twitter, Microsoft?
- [ ] Two-factor authentication (2FA) support?
- [ ] Single sign-on (SSO) for team/enterprise?

### Data Features
- [ ] Data download for GDPR compliance ready?
- [ ] Encrypted backups to user's cloud storage?
- [ ] Database versioning and migration strategy?

### Monetization (Future)
- [ ] Freemium model with paid features?
- [ ] Premium features: advanced analytics, export, etc.?
- [ ] Subscription vs. one-time purchase?

---

**Last Updated**: January 4, 2026  
**Next Review**: When features are added to the brief
