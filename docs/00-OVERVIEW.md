# Goal Tracker Web App - Developer Documentation

Welcome! This documentation is designed to help you understand the structure and functionality of the Goal Tracker application. Even if you're new to React and TypeScript, you'll find links to external resources and clear explanations of technical concepts.

## 📚 Documentation Structure

This documentation is organized into several sections:

### Getting Started
- **[README](./README.md)** - Quick facts about the project

### Architecture & Design
- **[Architecture Overview](./01-ARCHITECTURE.md)** - System design, data flow, and component structure
- **[Data Types & TypeScript](./02-DATA-TYPES.md)** - Understanding the data structures used throughout the app

### Feature Documentation
- **[Authentication (Auth Flow)](./03-AUTHENTICATION.md)** - How users sign up, log in, and stay authenticated
- **[Goals Management](./04-GOALS.md)** - Creating, editing, and managing goals
- **[Progress Tracking](./05-PROGRESS-TRACKING.md)** - Logging and displaying progress
- **[Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)** - How data syncs between the app and Firebase

### Code Organization
- **[Components Guide](./07-COMPONENTS.md)** - React component breakdown
- **[Services Guide](./08-SERVICES.md)** - Business logic and API integration
- **[Configuration](./09-CONFIGURATION.md)** - Firebase setup and environment variables

### Testing & Deployment
- **[Testing Guide](./10-TESTING.md)** - Unit tests, E2E tests, and BDD features
- **[Deployment](./11-DEPLOYMENT.md)** - Building and deploying the app

### Reference
- **[Glossary](./GLOSSARY.md)** - Technical terms and concepts explained
- **[Learning Resources](./LEARNING-RESOURCES.md)** - External links to React, TypeScript, and Firebase docs

## 🎯 Quick Navigation by Task

### "I need to add a new feature"
1. Start with [Architecture Overview](./01-ARCHITECTURE.md) to understand data flow
2. Check [Data Types](./02-DATA-TYPES.md) to see what data structures exist
3. Look at [Components](./07-COMPONENTS.md) to understand the UI structure
4. Check [Services](./08-SERVICES.md) for backend/API logic

### "I need to fix a bug in goal creation"
1. Check [Goals Management](./04-GOALS.md) to understand the feature
2. Look at [Components](./07-COMPONENTS.md) for the `CreateGoalModal` component
3. Check [Services](./08-SERVICES.md) for `goalService.ts`
4. See [Testing Guide](./10-TESTING.md) to write tests

### "I need to understand how progress is tracked"
1. Read [Progress Tracking](./05-PROGRESS-TRACKING.md)
2. Check [Services Guide](./08-SERVICES.md) for `progressService.ts`
3. Look at [Components Guide](./07-COMPONENTS.md) for progress-related components

### "I need to deploy to production"
1. Check [Configuration](./09-CONFIGURATION.md) for environment setup
2. See [Deployment Guide](./11-DEPLOYMENT.md) for build and deployment steps

## 🔍 Key Concepts at a Glance

### The App's Core Purpose
Users can create **goals** (things they want to track), log **progress** towards those goals daily/weekly/monthly, and view analytics about how they're doing.

### Technology Stack
- **Frontend**: React 18+ with TypeScript (strongly-typed JavaScript)
- **Database**: Firebase Firestore (cloud database)
- **Authentication**: Firebase Auth (login/signup)
- **Offline Support**: IndexedDB (browser's local database) + Service Workers

### Key Design Decision: Offline-First
The app can work completely offline. It stores data locally first, then syncs with Firebase when the connection is restored. This makes the app fast and reliable even on poor connections.

## 📖 Reading the Documentation

Each documentation file follows this structure:
- **Overview** - What is this feature/component for?
- **How it works** - Technical explanation
- **Key Files** - Which files implement this feature
- **Common Tasks** - Step-by-step guides for common changes
- **Code Examples** - Real examples from the codebase
- **External Resources** - Links to learn more

## 🆘 Still Confused?

- Check the [Glossary](./GLOSSARY.md) for technical terms
- Look up React/TypeScript concepts in [Learning Resources](./LEARNING-RESOURCES.md)
- Read the comments in the actual source code files
- Check the test files (`*.test.tsx` or `*.spec.ts`) to see how features are used

---

**Last Updated**: January 2026
**Framework**: React 18+
**Language**: TypeScript 5+
