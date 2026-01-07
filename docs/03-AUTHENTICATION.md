# Authentication (Auth Flow)

This document explains how users authenticate (sign up, log in, log out) in the Goal Tracker app.

## Overview

**Authentication** is the process of verifying that a user is who they claim to be. In this app:
- Users sign up with email and password
- Users log in with credentials
- The app stores their session securely
- Users stay logged in until they manually log out

## Firebase Authentication

The app uses [Firebase Authentication](https://firebase.google.com/docs/auth), a managed authentication service by Google. This means we don't have to build authentication from scratch.

### Why Firebase Auth?

```
Manual Auth (risky, lots of code)          Firebase Auth (secure, pre-built)
├─ Hash passwords                          ├─ Auto password hashing
├─ Store securely                          ├─ Secure storage
├─ Handle sessions                         ├─ Automatic session management
├─ Validate emails                         ├─ Email verification
└─ Prevent hacking attacks                 └─ Built-in security
```

## Authentication Flow

### Sign Up Process

```
User enters email & password
         │
         ▼
User clicks "Sign Up"
         │
         ▼
CreateUserWithEmailAndPassword (Firebase Auth)
         │
         ├─ Validate email format
         ├─ Check password strength
         ├─ Hash password
         ├─ Store user account
         │
         ▼
Firebase returns User object with uid
         │
         ▼
AuthContext updates (user state is set)
         │
         ▼
Component re-renders (show DashboardPage instead of LoginPage)
```

### Log In Process

```
User enters email & password
         │
         ▼
User clicks "Log In"
         │
         ▼
SignInWithEmailAndPassword (Firebase Auth)
         │
         ├─ Find account by email
         ├─ Compare password hash
         │
         ▼
Firebase returns User object with uid
         │
         ▼
AuthContext updates (user state is set)
         │
         ▼
App redirects to DashboardPage
```

### Log Out Process

```
User clicks "Logout"
         │
         ▼
SignOut (Firebase Auth)
         │
         ├─ Clear session
         ├─ Clear local cache
         │
         ▼
AuthContext updates (user = null)
         │
         ▼
App redirects to LoginPage
```

## Key Files

### [src/context/AuthContext.tsx](../src/context/AuthContext.tsx)

Manages authentication state and provides auth methods to the entire app.

**Key Components**:
- `user` - Currently logged-in user (or null)
- `isLoading` - Is authentication checking in progress?
- `error` - Any authentication errors?
- `signup()` - Function to create new account
- `login()` - Function to log in
- `logout()` - Function to log out

```typescript
// How to use AuthContext
const { user, login, logout, error } = useAuth()

if (!user) {
  return <LoginPage />  // Not logged in
}

return <DashboardPage user={user} />  // Logged in
```

### [src/config/firebase.ts](../src/config/firebase.ts)

Configures and initializes Firebase services.

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... other config values
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### [src/pages/LoginPage.tsx](../src/pages/LoginPage.tsx)

The login form component.

### [src/pages/SignupPage.tsx](../src/pages/SignupPage.tsx)

The signup form component.

## How It Works: Detailed Walkthrough

### 1. Initialization

When the app starts, `AuthContext` checks if there's a logged-in user:

```typescript
useEffect(() => {
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // User is logged in
      setUser(convertToAppUser(firebaseUser))
    } else {
      // User is logged out
      setUser(null)
    }
    setIsLoading(false)
  })

  return () => unsubscribe()
}, [])
```

This runs every time the app loads. If the user's browser has a valid session, they stay logged in.

### 2. Sign Up

```typescript
const signup = async (email: string, password: string) => {
  try {
    // Create Firebase user account
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Firebase automatically logs them in
    // The onAuthStateChanged listener above fires
    // setUser() is called automatically
  } catch (error) {
    setError(error.message)
  }
}
```

### 3. Log In

```typescript
const login = async (email: string, password: string) => {
  try {
    // Verify credentials with Firebase
    await signInWithEmailAndPassword(auth, email, password)
    
    // Firebase automatically updates session
    // The onAuthStateChanged listener above fires
    // setUser() is called automatically
  } catch (error) {
    setError(error.message)
  }
}
```

### 4. Log Out

```typescript
const logout = async () => {
  try {
    // Clear session
    await signOut(auth)
    
    // onAuthStateChanged listener fires
    // setUser(null) is called automatically
  } catch (error) {
    setError(error.message)
  }
}
```

## Security: How Data Stays Protected

### 1. Password Hashing

Passwords are never stored as plain text. Firebase hashes them (one-way encryption):

```
User's password: "MyPassword123"
         │
         ▼ (Hashing - cannot be reversed)
Firebase stores: "$2b$12$R9h/cIPz0gi.URNNGNMJM.OhNNIV..."

When user logs in:
User enters: "MyPassword123"
         │
         ▼ (Same hashing)
Compare: "$2b$12$R9h/cIPz0gi.URNNGNMJM.OhNNIV..." ✅ Match!
```

### 2. Session Tokens

After authentication, Firebase gives the app a **session token** (like a temporary ID card):

```
User successfully logs in
         │
         ▼
Firebase creates session token (expires after ~1 hour)
         │
         ▼
Token stored in browser (secure, encrypted)
         │
         ▼
All requests to Firebase include token
```

### 3. Firestore Security Rules

Even if someone gets the session token, they can only access their own data:

```
// In Firestore security rules
match /goals/{document=**} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

This means: "Users can only access goals where their uid matches userId field"

## Authentication with Context API

The app uses [React Context API](https://react.dev/learn/passing-data-deeply-with-context) to make authentication available everywhere.

**What is Context?**

Context lets you share state (like user info) without passing it through every component:

```
Without Context (prop drilling):
┌─ App
│  └─ Layout
│     └─ Header
│        └─ UserProfile (needs user info)
│
Have to pass `user` prop through Layout → Header → UserProfile

With Context:
┌─ App
│  ├─ AuthContext.Provider (provides user)
│  └─ Header
│     └─ UserProfile (gets user from context)
│
UserProfile can access user directly from context
```

### Using AuthContext

```typescript
import { useAuth } from '@/context/AuthContext'

export function UserProfile() {
  const { user, logout } = useAuth()
  
  if (!user) return <p>Not logged in</p>
  
  return (
    <div>
      <p>Hello {user.displayName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Common Tasks

### Add a "Remember Me" Feature

1. In [src/context/AuthContext.tsx](../src/context/AuthContext.tsx), add a `rememberMe` parameter to login:

```typescript
const login = async (email: string, password: string, rememberMe: boolean) => {
  // ... existing login code ...
  
  if (rememberMe) {
    localStorage.setItem('lastEmail', email)
  }
}
```

2. Update the LoginPage to use it:

```typescript
const [rememberMe, setRememberMe] = useState(false)

const handleLogin = async () => {
  await login(email, password, rememberMe)
}

return (
  <input 
    type="checkbox" 
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
  />
)
```

### Add Email Verification

1. After signup, ask Firebase to send verification email:

```typescript
const signup = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  
  // Send verification email
  await sendEmailVerification(result.user)
  
  setMessage('Check your email to verify your account')
}
```

### Handle Auth Errors Better

```typescript
const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      setError('No account found with that email')
    } else if (error.code === 'auth/wrong-password') {
      setError('Incorrect password')
    } else {
      setError(error.message)
    }
  }
}
```

## Troubleshooting

### "Authentication initialization timeout"

This usually means Firebase config is wrong or missing.

**Check**:
1. `.env.local` has correct Firebase credentials
2. Firebase API key is not restricted to certain domains
3. Firebase project exists and is active

### User gets logged out unexpectedly

Session tokens expire after 1 hour. Firebase should refresh automatically, but:

1. Check browser cache settings
2. Check for security policies blocking token storage
3. Ensure Firestore is accessible

### "PERMISSION_DENIED" errors

User's security rules don't match. Check:

1. User is logged in (`user !== null`)
2. `userId` in Firestore documents matches user's `uid`
3. Security rules allow the operation

## External Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [JSON Web Tokens (JWT)](https://jwt.io/introduction)

---

**Related Documentation**:
- [Architecture Overview](./01-ARCHITECTURE.md)
- [Configuration](./09-CONFIGURATION.md)
- [Glossary](./GLOSSARY.md) - Look up: "Authentication", "Token", "Hash"
