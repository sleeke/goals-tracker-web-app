# Firebase Configuration & Environment Setup

## Firebase Initialization

The Firebase SDK is initialized in `src/config/firebase.ts`.

### Required Environment Variables

Create a `.env.local` file in the root directory with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional, for Analytics)
```

### How to Get These Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Click "Settings" (gear icon) → "Project Settings"
4. Go to "Your apps" section
5. Select or create a web app
6. Copy the config object and extract the values above

## Firebase Services Setup

### Authentication
- Email/Password authentication is enabled by default
- To enable Google Sign-In:
  - Firebase Console → Authentication → Sign-in method
  - Enable "Google" provider
  - Configure OAuth consent screen

- To enable Apple Sign-In:
  - Firebase Console → Authentication → Sign-in method
  - Enable "Apple" provider
  - Follow Apple's configuration guide

### Firestore Database
- Create Firestore database in production mode
- Location: Choose closest to your users
- Security Rules: See `docs/data-model.md` for full rules

### Cloud Storage (Optional for future features)
- Enable Cloud Storage for profile pictures, backups, etc.

## Development Environment

For local development without Firebase backend:

1. Use Firebase emulator suite:
   ```bash
   npm install -g firebase-tools
   firebase emulators:start --only firestore,auth
   ```

2. Update `src/config/firebase.ts` to connect to emulator:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     connectAuthEmulator(auth, 'http://localhost:9099');
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

## Production Deployment

1. Configure Firebase Hosting:
   ```bash
   firebase init hosting
   firebase deploy
   ```

2. Enable CORS for API requests (if needed)

3. Set up backup strategy for Firestore:
   - Automated backups via Firebase
   - Or export data periodically

## Monitoring & Analytics

- Firebase Console provides usage metrics
- Use Firebase Analytics for user behavior tracking (optional)
- Set up alerts for quota limits

## Security Checklist

- [ ] API keys restricted to web domain only
- [ ] Firestore security rules reviewed and tested
- [ ] Authentication providers configured
- [ ] HTTPS enforced for all connections
- [ ] User data encryption verified
- [ ] Backup strategy implemented
- [ ] Rate limiting considered for API calls
- [ ] GDPR compliance reviewed

---

See `src/config/firebase.ts` for implementation details.
