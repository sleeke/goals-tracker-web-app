/**
 * TypeScript types and interfaces for the Goal Tracker app
 * Based on the data model in plans/DATA_MODEL.md
 */

/**
 * User Profile
 */
export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
  settings: UserSettings
  lastSyncTime: Date
}

export interface UserSettings {
  theme: 'light' | 'dark'
  timezone: string
  notificationsEnabled: boolean
  dataExportFormat: 'csv' | 'json' | 'pdf'
}

/**
 * Goal Definition
 */
export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetValue: number
  unit: string // e.g., "pages", "miles", "hours"
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'completed'
  completedDate?: Date
  yearlyTarget?: number
  priority: 'low' | 'medium' | 'high'
  color: string // hex color for UI
  notes?: string
  localChanges?: boolean // for offline sync
  lastModifiedLocallyAt?: number
}

/**
 * Progress Entry
 */
export interface Progress {
  id: string
  goalId: string
  value: number
  timestamp: Date // when progress occurred (supports retroactive)
  loggedAt: Date // when user recorded this entry
  note?: string
  isRetroactive: boolean
  revertedBy?: string // progressId that reverted this entry
  metadata: ProgressMetadata
  localChanges?: boolean
  lastModifiedLocallyAt?: number
}

export interface ProgressMetadata {
  deviceId: string
  syncStatus: 'pending' | 'synced' | 'failed'
}

/**
 * Audit Log Entry
 */
export interface AuditLog {
  id: string
  userId: string
  entityType: 'goal' | 'progress'
  entityId: string
  action: 'create' | 'update' | 'delete' | 'revert'
  changesBefore: Record<string, unknown>
  changesAfter: Record<string, unknown>
  performedBy: string
  performedAt: Date
  deviceId: string
  syncedAt?: Date
}

/**
 * Period Information
 */
export interface Period {
  type: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  label: string // "Today", "This Week", "This Month", etc.
}

/**
 * Progress Summary for a Goal
 */
export interface ProgressSummary {
  goalId: string
  current: number
  target: number
  percentage: number
  period: Period
  lastUpdated: Date
  entries: Progress[]
}

/**
 * Yearly Progress Summary
 */
export interface YearlyProgressSummary {
  goalId: string
  year: number
  total: number
  yearlyTarget?: number
  percentage: number
  completedPeriods: number
  totalPeriods: number
}

/**
 * Dashboard Data
 */
export interface DashboardGoal {
  goal: Goal
  currentPeriod: ProgressSummary
  yearly: YearlyProgressSummary
  streak?: StreakInfo
}

export interface DashboardData {
  user: User
  goals: DashboardGoal[]
  lastSync: Date
}

/**
 * Streak Information
 */
export interface StreakInfo {
  current: number
  longest: number
  lastCompletedDate: Date
}

/**
 * Sync Queue Item (for offline operations)
 */
export interface SyncQueueItem {
  id: string
  entityType: 'goal' | 'progress'
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  createdAt: number
  retryCount: number
  lastRetryAt?: number
  error?: string
}

/**
 * Export Data (for CSV/JSON/PDF export)
 */
export interface ExportData {
  exportDate: Date
  user: User
  goals: Goal[]
  progress: Progress[]
  auditLog: AuditLog[]
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Auth State
 */
export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

/**
 * Sync State
 */
export interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  failedOperations: SyncQueueItem[]
  error: string | null
}
