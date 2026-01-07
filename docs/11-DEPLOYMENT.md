# Deployment

This document explains how to build and deploy the Goal Tracker application.

## Build Process

### What is a Build?

A **build** converts your React/TypeScript code into optimized JavaScript that browsers can run.

```
Source Code (development)      Build Process      Browser Code (production)
├─ React components            ├─ Compile TS→JS   ├─ Minified .js
├─ TypeScript files            ├─ Bundle files    ├─ Optimized images
├─ CSS files                   ├─ Optimize        ├─ Cached assets
└─ Assets                      └─ Minify          └─ Service worker
```

### Build Command

```bash
npm run build
```

This:
1. Compiles TypeScript → JavaScript
2. Bundles React and dependencies
3. Minifies code (removes unnecessary characters)
4. Optimizes assets
5. Creates `dist/` folder with production files

### Output

```
dist/
├── index.html                 # Main HTML file
├── assets/
│   ├── index-xxx.js          # App JavaScript (minified)
│   ├── index-xxx.css         # App CSS (minified)
│   └── images/               # Optimized images
├── registerSW.js             # Service worker registration
└── manifest.json             # PWA manifest
```

## Preview Build Locally

Before deploying, test the production build:

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:5173` to test the production version locally.

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

Firebase provides free hosting integrated with your Firebase project.

#### Setup

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init hosting
```

Choose:
- Existing Firebase project: Your project
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub workflow: `No` (for now)

This creates `firebase.json` and `.firebaserc`.

#### Deploy

```bash
# Build first
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

Your app is now live at: `https://your-project.web.app`

#### See Deployment

```bash
firebase open hosting:site
```

#### Rollback

```bash
firebase hosting:channel:list
firebase deploy --only hosting -m "Rollback to version X"
```

### Option 2: Vercel

Vercel provides automatic deployments from GitHub.

#### Setup

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select GitHub repository
5. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables (VITE_FIREBASE_*)
7. Click "Deploy"

Your app is now live at: `https://your-project.vercel.app`

### Option 3: Netlify

Another popular hosting platform.

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add environment variables
6. Click "Deploy"

### Option 4: Self-Hosted (VPS)

For complete control over your server.

#### Using Node.js

```bash
# On your server:
npm install
npm run build

# Serve with Node:
npm install -g serve
serve -s dist -l 3000
```

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:

```bash
docker build -t goal-tracker .
docker run -p 3000:3000 goal-tracker
```

## Environment Configuration for Production

### Update .env.local for Production

Use production Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=prod_key_...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase variables
```

### Security Considerations

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use environment-specific variables**:
   ```bash
   # Development
   VITE_APP_ENV=development
   
   # Production
   VITE_APP_ENV=production
   ```

3. **Restrict Firebase API Key** in Firebase Console:
   - Go to Settings → API Keys
   - Click edit on your key
   - Set restrictions to your domain
   - Restrict to Firestore, Auth, Hosting

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Run tests: `npm run test`
- [ ] Check types: `npm run type-check`
- [ ] Lint code: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Preview build: `npm run preview`
- [ ] Test on real device (mobile)
- [ ] Check console for errors (DevTools)
- [ ] Verify performance (Lighthouse)
- [ ] Test all features:
  - [ ] Login/Signup
  - [ ] Create goal
  - [ ] Log progress
  - [ ] Delete goal
  - [ ] Offline mode
  - [ ] Sync when back online
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on multiple devices (Desktop, Mobile, Tablet)
- [ ] Update version in `package.json`
- [ ] Review Firestore security rules
- [ ] Backup production data

## Performance Optimization

### Analyze Bundle Size

```bash
npm install -g vite-plugin-visualizer

# In vite.config.ts, add:
import visualizer from 'rollup-plugin-visualizer'

plugins: [
  visualizer(),
]

# Build and check:
npm run build
# Open dist/stats.html
```

### Common Optimizations

1. **Code Splitting** - Break bundle into smaller pieces:
```typescript
// Load component lazily
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

2. **Image Optimization** - Use optimized formats:
```typescript
// Use WebP with fallback:
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.png" alt="Goal" />
</picture>
```

3. **Remove Unused Packages**:
```bash
npm prune
npm audit fix
```

4. **Tree Shaking** - Remove unused code:
```typescript
// Good - tree-shakeable
import { createGoal } from '@/services/goalService'

// Bad - might include entire module
import * as goalService from '@/services/goalService'
```

### Lighthouse Audit

Run Google Lighthouse to find optimization opportunities:

1. Open app in Chrome
2. DevTools → Lighthouse tab
3. Click "Generate report"
4. Follow recommendations

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Monitoring & Debugging

### Firebase Console Monitoring

Monitor your deployed app:

1. Go to Firebase Console
2. Analytics → Dashboard
3. View:
   - Active users
   - Crashes
   - Performance
   - Custom events

### View Logs

```bash
firebase functions:log
```

### Performance Monitoring

Firebase automatically tracks:
- Page load times
- HTTP request latency
- Custom metrics

## Continuous Deployment (CI/CD)

Automatic deployment on code changes.

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: 'your-project-id'
```

### Setup GitHub Secrets

1. Go to GitHub repo → Settings → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT`:
   ```bash
   firebase login:ci
   ```
   This generates a token - add it as secret

3. Add `GITHUB_TOKEN` (auto-provided by GitHub)

Now on each `git push main`, GitHub automatically:
1. Runs tests
2. Builds app
3. Deploys to Firebase

## Rollback & Updates

### Rollback to Previous Version

```bash
# View deployment history
firebase hosting:channel:list

# Rollback
firebase deploy --only hosting
```

### Update in Production

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# GitHub Actions automatically deploys!
# Or manually:
npm run build
firebase deploy
```

## Troubleshooting Deployment

### Build Fails

Check error message:
```bash
npm run build 2>&1 | less
```

Common issues:
- Missing environment variables: Add to `.env.local`
- TypeScript errors: Run `npm run type-check`
- Lint errors: Run `npm run lint -- --fix`

### Firebase Deployment Fails

```bash
firebase deploy --debug
```

This shows detailed logs.

### App Loads But Features Don't Work

1. Check browser console for errors
2. Check Firebase rules restrict access
3. Verify environment variables in production
4. Check Network tab in DevTools for failed requests

### Slow Performance

Use Lighthouse to identify issues:
- Large bundle size: Code split more
- Slow network: Optimize images
- Slow rendering: Use React DevTools Profiler

## Monitoring & Alerts

### Setup Email Alerts

In Firebase Console:
1. Firestore Database → Rules
2. Add monitoring for errors
3. Billing → Budgets
4. Set alerts for unusual activity

### Monitor Cloud Errors

```bash
firebase functions:log --only "ERROR"
```

## Updating After Deployment

### Push Updates to Users

Users automatically get updates:
1. Service worker detects new version
2. Downloads in background
3. Prompts user to refresh
4. New version loads

### Force Users to Update

```typescript
// In App.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('controllerchange', () => {
        window.location.reload()  // Force refresh
      })
    })
  }
}, [])
```

## Maintenance

### Regular Tasks

- [ ] **Weekly**: Monitor error logs
- [ ] **Monthly**: Review analytics
- [ ] **Monthly**: Update dependencies: `npm update`
- [ ] **Quarterly**: Run security audit: `npm audit fix`
- [ ] **Quarterly**: Performance review with Lighthouse
- [ ] **Yearly**: Major dependency updates

### Backup Data

```bash
# Export Firestore
firebase firestore:export backup/

# Import Firestore
firebase firestore:import backup/
```

## External Resources

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [GitHub Actions](https://github.com/features/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

---

**Related Documentation**:
- [Configuration](./09-CONFIGURATION.md)
- [Testing Guide](./10-TESTING.md)
- [Architecture Overview](./01-ARCHITECTURE.md)
