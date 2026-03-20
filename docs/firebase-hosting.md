# Firebase Hosting Deployment Guide

Your Goal Tracker app is now configured for Firebase Hosting deployment!

## ✅ What's Configured

- **Vite Build Output**: `dist/` folder (standard Vite convention)
- **Firebase Hosting Public Directory**: Points to `dist/`
- **Routing**: All routes redirect to `index.html` (single-page app support)
- **PWA Support**: Service worker configured in Vite config

## 🚀 Deployment Steps

### 1. Build Your App
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder with:
- Minified JavaScript and CSS
- Source maps disabled for smaller bundle
- Service worker precaching

### 2. Preview Locally (Optional)
```bash
npm run preview
```

This starts a local preview server at `http://localhost:4173` that simulates the Firebase Hosting environment.

### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

If you haven't authenticated Firebase CLI yet:
```bash
firebase login
firebase init hosting
```

### 4. View Your Live App
After deployment, your app will be available at:
```
https://goal-tracker-web-app-10836.web.app
```

## 📦 Build Output

The `dist/` folder contains:
- `index.html` — Main entry point
- `assets/` — JavaScript, CSS, fonts bundled and minified
- `img/` — PWA icons and assets
- `manifest.json` — PWA manifest
- `sw.js` — Service worker for offline support

⚠️ **Never commit `dist/` to version control** — It's in `.gitignore` and will be rebuilt on each deployment.

## 🔄 Continuous Deployment (Optional)

For automatic deployments on git push, set up GitHub Actions:

1. Connect your GitHub repo to Firebase Console
2. Firebase Console → Hosting → Connect to GitHub
3. Select repository and branch
4. Firebase will auto-deploy on each push to that branch

## 🌍 Custom Domain (Optional)

To use a custom domain (e.g., mygoals.com):

1. Firebase Console → Hosting → Add Custom Domain
2. Follow domain verification steps
3. Update DNS settings with the provided records

## 📊 Monitor Deployment

Firebase Console → Hosting:
- View build logs
- See deployment history
- Check performance metrics
- View traffic analytics

## 🔐 Security Notes

- Firestore security rules are automatically deployed with `firebase deploy`
- HTTPS is automatically enforced
- All data is encrypted in transit and at rest

## 📝 .env Variables in Production

Environment variables from `.env.local` are:
- ✅ Automatically bundled into the built app (they're prefixed with `VITE_`)
- ✅ Safe to include (Firebase API keys are meant to be public)
- ✅ Not exposed in source control (`.env.local` is in `.gitignore`)

## Troubleshooting

### Build Fails
```bash
npm run type-check  # Check for TypeScript errors
npm run lint        # Check for linting errors
npm run build       # Try build again
```

### Deploy Fails
```bash
firebase deploy --only hosting --debug  # Verbose output
firebase login --reauth                  # Re-authenticate
```

### App Shows Old Version
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Clear service worker cache: DevTools → Application → Clear storage
- Wait up to 5 minutes for cache invalidation

### 404 on Refresh
This is likely already fixed (rewrites rule in `firebase.json`), but verify:
- Firebase Console → Hosting → Rewrite rules show: `** → /index.html`

## 🎉 You're Ready to Deploy!

Your app is now:
- ✅ Built for production
- ✅ Configured for Firebase Hosting
- ✅ PWA-ready with offline support
- ✅ Set up for automatic deployments (if using GitHub Actions)

Next steps:
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Deploy: `firebase deploy --only hosting`

---

**Deployment Configured**: January 4, 2026
