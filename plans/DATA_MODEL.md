# Data Model & Architecture

## Firestore Collections & Documents

### 1. `users` Collection
Stores user profile information and preferences.

```typescript
users/{userId}
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── settings: {
│   └── theme: "light" | "dark"
│   └── timezone: string
│   └── notificationsEnabled: boolean
│   └── dataExportFormat: "csv" | "json" | "pdf"
└── lastSyncTime: Timestamp
```

### 2. `goals` Collection
Stores goal definitions for each user.

```typescript
users/{userId}/goals/{goalId}
├── userId: string
├── title: string
├── description: string (optional)
├── category: string
├── frequency: "daily" | "weekly" | "monthly"
├── targetValue: number (units to achieve per period)
├── unit: string (e.g., "pages", "miles", "hours")
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── status: "active" | "archived" | "completed"
├── completedDate: Timestamp (optional, when yearly target hit)
├── yearlyTarget: number (optional, overrides 52*weekly or similar)
├── priority: "low" | "medium" | "high"
├── color: string (hex color for UI)
└── notes: string (optional)
```

### 3. `progress` Collection (Subcollection)
Stores individual progress entries for each goal.

```typescript
users/{userId}/goals/{goalId}/progress/{progressId}
├── goalId: string
├── value: number (progress amount logged)
├── timestamp: Timestamp (when this progress occurred)
├── loggedAt: Timestamp (when user recorded this entry)
├── note: string (optional context)
├── isRetroactive: boolean (true if manually backdated)
├── revertedBy: string (optional, progressId that supersedes if reverted)
└── metadata: {
    └── deviceId: string
    └── syncStatus: "pending" | "synced" | "failed"
}
```

### 4. `auditLog` Collection (Subcollection)
Tracks all mutations for audit trail and conflict resolution.

```typescript
users/{userId}/auditLog/{auditId}
├── entityType: "goal" | "progress"
├── entityId: string
├── action: "create" | "update" | "delete" | "revert"
├── changesBefore: object
├── changesAfter: object
├── performedBy: string (userId)
├── performedAt: Timestamp
├── deviceId: string
└── syncedAt: Timestamp
```

## IndexedDB Schema (Offline Local Storage)

Mirrors Firestore structure for offline-first capability.

### Object Stores

#### 1. `users` (Key: userId)
```typescript
{
  userId: string (primary key),
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: number (Unix timestamp),
  updatedAt: number,
  settings: object,
  lastSyncTime: number,
  syncVersion: number
}
```

#### 2. `goals` (Key: goalId, Index: userId)
```typescript
{
  goalId: string (primary key),
  userId: string (indexed),
  title: string,
  description: string,
  category: string,
  frequency: string,
  targetValue: number,
  unit: string,
  createdAt: number,
  updatedAt: number,
  status: string,
  completedDate: number,
  yearlyTarget: number,
  priority: string,
  color: string,
  notes: string,
  localChanges: boolean (true if not yet synced),
  lastModifiedLocallyAt: number
}
```

#### 3. `progress` (Key: progressId, Index: goalId)
```typescript
{
  progressId: string (primary key),
  goalId: string (indexed),
  value: number,
  timestamp: number,
  loggedAt: number,
  note: string,
  isRetroactive: boolean,
  revertedBy: string,
  metadata: object,
  localChanges: boolean,
  lastModifiedLocallyAt: number
}
```

#### 4. `syncQueue` (Key: queueId)
Stores mutations that failed to sync, retried when connection restored.

```typescript
{
  queueId: string (primary key),
  entityType: string,
  action: string,
  payload: object,
  createdAt: number,
  retryCount: number,
  lastRetryAt: number,
  error: string
}
```

#### 5. `auditLog` (Key: auditId, Index: userId)
```typescript
{
  auditId: string (primary key),
  userId: string (indexed),
  entityType: string,
  entityId: string,
  action: string,
  changesBefore: object,
  changesAfter: object,
  performedAt: number,
  deviceId: string,
  syncedAt: number
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /goals/{goalId} {
        allow read, write: if request.auth.uid == userId;
        
        match /progress/{progressId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
      
      match /auditLog/{auditId} {
        allow read: if request.auth.uid == userId;
        allow create: if request.auth.uid == userId;
      }
    }
  }
}
```

## Data Synchronization Flow

### Offline-First Write Operations

1. **Local Write**
   - User performs action (create goal, log progress)
   - Change written to IndexedDB immediately (optimistic update)
   - UI reflects change instantly
   - localChanges flag set to true

2. **Background Sync**
   - Service worker detects online status
   - Queued changes from syncQueue sent to Firestore
   - Each mutation includes deviceId and timestamp for conflict resolution

3. **Conflict Resolution**
   - If write fails due to conflict (e.g., both devices modified same doc):
     - Last-write-wins: Compare timestamps, keep newer version
     - Log conflict in auditLog
     - Retry with conflict metadata
     - Notify user if manual merge needed

4. **Sync Success**
   - Document synced to Firestore
   - localChanges flag set to false
   - syncStatus updated to "synced"
   - UI confirms sync state

### Real-time Sync (Read Operations)

1. **Firestore Listener**
   - App registers listener on goals and progress collections
   - Firestore updates IndexedDB when server data changes
   - UI re-renders with latest data

2. **Cross-Device Sync**
   - User updates goal on Device A (online)
   - Firestore listener on Device B detects change
   - Device B's IndexedDB updated automatically
   - User sees updated progress on all devices in real-time

## Timestamp Strategy

- **createdAt**: Server timestamp, set once, never changes
- **updatedAt**: Server timestamp, updated on any change
- **loggedAt**: Client timestamp when progress entered
- **timestamp**: Client timestamp when progress actually occurred (supports retroactive)
- **performedAt**: Client timestamp when audit event occurred
- **syncedAt**: Server timestamp when synced

## Device Identification

Each device gets a unique `deviceId`:
- Generated on first app load
- Stored in browser localStorage
- Used in conflict resolution and audit logs
- Allows tracking which device made changes

## Yearly Progress Calculation

For each goal:
- **Daily**: Sum of all daily progress entries for the calendar year
- **Weekly**: Sum of all weekly progress entries for the calendar year (52 weeks)
- **Monthly**: Sum of all monthly progress entries for the calendar year (12 months)

Calculation queries:
```typescript
// Yearly progress for a goal
const yearStart = new Date(new Date().getFullYear(), 0, 1);
const yearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

db.collection('users').doc(userId)
  .collection('goals').doc(goalId)
  .collection('progress')
  .where('timestamp', '>=', yearStart)
  .where('timestamp', '<', yearEnd)
  .where('revertedBy', '==', null)  // Exclude reverted entries
  .get();
```

## Period Calculation

- **Daily Period**: Midnight to midnight (user's timezone)
- **Weekly Period**: Monday 00:00 to Sunday 23:59 (user's timezone)
- **Monthly Period**: 1st to last day of month (user's timezone)

Current period determined by:
1. User's timezone from settings
2. Server timestamp or client timestamp (offline mode)
3. Filter progress entries by period date range

## Backup & Export Strategy

User can export their data:
- **Format Options**: CSV, JSON, PDF
- **Content**: All goals, progress history, audit logs
- **Trigger**: Manual export from Settings page
- **Storage**: Downloaded to user's device

## Data Retention Policy

- **Active Data**: Kept indefinitely while account is active
- **Deleted Data**: Soft delete (status="archived") retained for 90 days, then hard deleted
- **Audit Logs**: Retained for 1 year for compliance
- **Account Deletion**: All user data hard deleted within 30 days of request

---

**Last Updated**: January 4, 2026
