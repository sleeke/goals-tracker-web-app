# Documentation

Welcome to the Goal Tracker documentation! This folder contains comprehensive guides to understand and modify the Goal Tracker web application.

## 📖 Start Here

New to the project? Start with the **[Overview](./00-OVERVIEW.md)** - it explains the documentation structure and helps you navigate to what you need.

## 📑 Quick Index

| Document | Purpose |
|----------|---------|
| [00-OVERVIEW.md](./00-OVERVIEW.md) | Start here! Navigation guide and project overview |
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System design, data flow, and how everything connects |
| [02-DATA-TYPES.md](./02-DATA-TYPES.md) | TypeScript types used throughout the app |
| [03-AUTHENTICATION.md](./03-AUTHENTICATION.md) | User login, signup, and authentication |
| [04-GOALS.md](./04-GOALS.md) | Creating, editing, and managing goals |
| [05-PROGRESS-TRACKING.md](./05-PROGRESS-TRACKING.md) | Logging and displaying progress |
| [06-OFFLINE-FIRST-SYNC.md](./06-OFFLINE-FIRST-SYNC.md) | How offline mode and sync work |
| [07-COMPONENTS.md](./07-COMPONENTS.md) | React components and UI structure |
| [08-SERVICES.md](./08-SERVICES.md) | Business logic and API integration |
| [09-CONFIGURATION.md](./09-CONFIGURATION.md) | Setting up Firebase, environment variables, etc. |
| [10-TESTING.md](./10-TESTING.md) | Unit tests, component tests, and E2E tests |
| [11-DEPLOYMENT.md](./11-DEPLOYMENT.md) | Building and deploying the app |
| [GLOSSARY.md](./GLOSSARY.md) | Technical terms explained |
| [LEARNING-RESOURCES.md](./LEARNING-RESOURCES.md) | External links to learn React, TypeScript, etc. |

## 🎯 By Task

### "I need to add a feature"
1. Read [Architecture Overview](./01-ARCHITECTURE.md)
2. Check [Data Types](./02-DATA-TYPES.md)
3. Look at [Components](./07-COMPONENTS.md) & [Services](./08-SERVICES.md)
4. Follow [Testing Guide](./10-TESTING.md) to write tests

### "I need to understand how authentication works"
→ Read [Authentication](./03-AUTHENTICATION.md)

### "I need to modify goal creation/management"
→ Read [Goals](./04-GOALS.md) + [Components](./07-COMPONENTS.md) + [Services](./08-SERVICES.md)

### "I need to understand progress tracking"
→ Read [Progress Tracking](./05-PROGRESS-TRACKING.md)

### "I need to understand offline functionality"
→ Read [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)

### "I need to set up Firebase"
→ Read [Configuration](./09-CONFIGURATION.md)

### "I need to deploy the app"
→ Read [Deployment](./11-DEPLOYMENT.md)

### "I need to write tests"
→ Read [Testing Guide](./10-TESTING.md)

### "I need to understand a technical term"
→ Check [Glossary](./GLOSSARY.md)

### "I need to learn React/TypeScript"
→ See [Learning Resources](./LEARNING-RESOURCES.md)

## 🧭 Navigation Tips

### All documents include:
- **Overview** - What is this?
- **How it works** - Detailed explanation
- **Key files** - Where the code is
- **Code examples** - Real code from the project
- **External resources** - Links to learn more
- **Related documentation** - Links to other docs

### Use the Glossary
If you see an unfamiliar term, look it up in [GLOSSARY.md](./GLOSSARY.md). Most terms have links to external resources.

### Learn by Reading Code
Each feature document shows the actual code files involved. Read the code alongside the documentation.

## 🚀 Getting Started Checklist

- [ ] Read [Overview](./00-OVERVIEW.md)
- [ ] Skim [Architecture](./01-ARCHITECTURE.md)
- [ ] Read the feature docs for what you're working on
- [ ] Look at the code files mentioned
- [ ] Reference [Services Guide](./08-SERVICES.md) for business logic
- [ ] Reference [Components Guide](./07-COMPONENTS.md) for UI
- [ ] Write tests following [Testing Guide](./10-TESTING.md)
- [ ] Check [Learning Resources](./LEARNING-RESOURCES.md) if concepts are unclear

## 📝 Documentation Conventions

### Code Examples
```typescript
// TypeScript/JavaScript code looks like this
const goal = await createGoal(userId, goalData)
```

### File References
Links to code files use relative paths:
```
[src/services/goalService.ts](../src/services/goalService.ts)
```

### External Links
Links to external resources use full URLs:
```
[React Documentation](https://react.dev)
```

### Key Terms
Important concepts are **bolded** on first mention and link to glossary:
```
**Service** - Business logic separate from UI
```

## 🔗 Related Files

- **[README.md](../README.md)** - Project overview and quick start
- **[GETTING_STARTED.md](../GETTING_STARTED.md)** - Initial setup guide
- **[PROJECT_BRIEF.md](../plans/PROJECT_BRIEF.md)** - Project requirements
- **[package.json](../package.json)** - Dependencies and scripts

## 💡 Tips for Using This Documentation

1. **Search as you read**: Use Ctrl+F (Cmd+F) to find specific terms
2. **Follow the links**: Click internal links to learn more about topics
3. **Read the code**: Look at actual source files mentioned
4. **Refer back often**: Come back to docs when making changes
5. **Update docs**: If you find errors or want to add information, update the docs!

## ❓ Questions?

If something in the documentation is unclear:
1. Check the [Glossary](./GLOSSARY.md)
2. Check [Learning Resources](./LEARNING-RESOURCES.md)
3. Look at the code files mentioned
4. Search the actual source code comments

## 📚 Document Structure

Each major feature has its own document following this structure:

```
# Feature Name

## What is [Feature]?
Simple explanation of the feature

## Overview/Architecture
How the feature works at high level

## Key Files
Files involved in this feature

## How It Works
Detailed step-by-step explanation

## Functions/Components
Reference section for key functions

## Common Tasks
Step-by-step guides for common modifications

## Troubleshooting
Common issues and solutions

## External Resources
Links to learn more
```

## 🎓 Learning Path Suggestions

### Path 1: New to React & TypeScript
1. [Overview](./00-OVERVIEW.md) - Understand the project
2. [Architecture](./01-ARCHITECTURE.md) - See how it fits together
3. [Data Types](./02-DATA-TYPES.md) - Learn the type system
4. Pick a feature to read (Authentication, Goals, Progress)
5. [Components Guide](./07-COMPONENTS.md) - Understand UI
6. [Services Guide](./08-SERVICES.md) - Understand logic
7. [Testing Guide](./10-TESTING.md) - Write your first test

### Path 2: Experienced Frontend Developer
1. [Architecture](./01-ARCHITECTURE.md) - Quick overview
2. Pick features you'll work on
3. [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md) - Unique aspect
4. [Services Guide](./08-SERVICES.md) - Implementation details
5. [Testing Guide](./10-TESTING.md)
6. [Deployment](./11-DEPLOYMENT.md) - How to ship code

### Path 3: Full-Stack Developer
1. [Architecture](./01-ARCHITECTURE.md) - Overall design
2. [Configuration](./09-CONFIGURATION.md) - Firebase setup
3. Feature docs as needed
4. [Deployment](./11-DEPLOYMENT.md)
5. [Testing](./10-TESTING.md) - Integration testing

---

**Happy learning! 🚀**

For any questions or improvements to the documentation, please reach out or create an issue.
