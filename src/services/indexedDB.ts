import type { Goal, Progress } from '@/types'

const DB_NAME = 'GoalTrackerDB'
const DB_VERSION = 1
const GOALS_STORE = 'goals'
const PROGRESS_STORE = 'progress'
const SYNC_QUEUE_STORE = 'syncQueue'

let db: IDBDatabase | null = null

/**
 * Initialize IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create goals store
      if (!database.objectStoreNames.contains(GOALS_STORE)) {
        const goalsStore = database.createObjectStore(GOALS_STORE, { keyPath: 'id' })
        goalsStore.createIndex('userId', 'userId', { unique: false })
        goalsStore.createIndex('status', 'status', { unique: false })
      }

      // Create progress store
      if (!database.objectStoreNames.contains(PROGRESS_STORE)) {
        const progressStore = database.createObjectStore(PROGRESS_STORE, { keyPath: 'id' })
        progressStore.createIndex('goalId', 'goalId', { unique: false })
        progressStore.createIndex('userId', 'userId', { unique: false })
        progressStore.createIndex('loggedAt', 'loggedAt', { unique: false })
      }

      // Create sync queue store
      if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        database.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

/**
 * Save a goal to IndexedDB
 */
export async function saveGoalLocally(goal: Goal): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GOALS_STORE], 'readwrite')
    const store = transaction.objectStore(GOALS_STORE)
    const request = store.put(goal)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get all goals for a user from IndexedDB
 */
export async function getGoalsLocally(userId: string): Promise<Goal[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GOALS_STORE], 'readonly')
    const store = transaction.objectStore(GOALS_STORE)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as Goal[])
  })
}

/**
 * Delete a goal from IndexedDB
 */
export async function deleteGoalLocally(goalId: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([GOALS_STORE], 'readwrite')
    const store = transaction.objectStore(GOALS_STORE)
    const request = store.delete(goalId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Save progress to IndexedDB
 */
export async function saveProgressLocally(progress: Progress): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROGRESS_STORE], 'readwrite')
    const store = transaction.objectStore(PROGRESS_STORE)
    const request = store.put(progress)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get progress for a goal from IndexedDB
 */
export async function getProgressLocally(goalId: string): Promise<Progress[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROGRESS_STORE], 'readonly')
    const store = transaction.objectStore(PROGRESS_STORE)
    const index = store.index('goalId')
    const request = index.getAll(goalId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as Progress[])
  })
}

/**
 * Delete progress from IndexedDB
 */
export async function deleteProgressLocally(progressId: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PROGRESS_STORE], 'readwrite')
    const store = transaction.objectStore(PROGRESS_STORE)
    const request = store.delete(progressId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Add operation to sync queue
 */
export async function queueSyncOperation(operation: {
  type: 'create' | 'update' | 'delete'
  collection: 'goals' | 'progress'
  data: any
}): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.add({
      ...operation,
      timestamp: Date.now(),
      synced: false,
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Get all pending sync operations
 */
export async function getPendingSyncOperations(): Promise<any[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const operations = (request.result as any[]).filter((op) => !op.synced)
      resolve(operations)
    }
  })
}

/**
 * Mark sync operation as completed
 */
export async function markSyncOperationComplete(operationId: number): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SYNC_QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(SYNC_QUEUE_STORE)
    const request = store.get(operationId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const operation = request.result
      if (operation) {
        operation.synced = true
        const updateRequest = store.put(operation)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      } else {
        resolve()
      }
    }
  })
}

/**
 * Clear all data from IndexedDB
 */
export async function clearLocalData(): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [GOALS_STORE, PROGRESS_STORE, SYNC_QUEUE_STORE],
      'readwrite'
    )

    transaction.objectStore(GOALS_STORE).clear()
    transaction.objectStore(PROGRESS_STORE).clear()
    transaction.objectStore(SYNC_QUEUE_STORE).clear()

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

/**
 * Check if app is online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Listen for online/offline changes
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
