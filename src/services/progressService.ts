import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  QueryConstraint,
  Timestamp,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Progress } from '@/types'

const PROGRESS_COLLECTION = 'progress'

/**
 * Log progress for a goal
 */
export async function logProgress(
  goalId: string,
  userId: string,
  value: number,
  note?: string,
  timestamp?: Date,
  isRetroactive?: boolean
): Promise<Progress> {
  try {
    const progressRef = await addDoc(collection(db, PROGRESS_COLLECTION), {
      goalId,
      userId,
      value,
      note: note || '',
      loggedAt: timestamp ? Timestamp.fromDate(timestamp) : Timestamp.now(),
      timestamp: timestamp ? Timestamp.fromDate(timestamp) : Timestamp.now(),
      isRetroactive: isRetroactive || false,
      metadata: {
        deviceId: generateDeviceId(),
        syncStatus: 'pending',
      },
    })

    return {
      id: progressRef.id,
      goalId,
      value,
      note: note || '',
      loggedAt: timestamp || new Date(),
      timestamp: timestamp || new Date(),
      isRetroactive: isRetroactive || false,
      metadata: {
        deviceId: generateDeviceId(),
        syncStatus: 'pending',
      },
    } as unknown as Progress
  } catch (error) {
    console.error('Error logging progress:', error)
    throw error
  }
}

function generateDeviceId(): string {
  // Simple device ID generation (could be enhanced)
  return `device_${Date.now()}`
}

/**
 * Get progress records for a specific goal
 */
export async function getGoalProgress(
  goalId: string,
  limit?: number
): Promise<Progress[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('goalId', '==', goalId),
      orderBy('loggedAt', 'desc'),
    ]
    
    if (limit) {
      // Note: firestore doesn't have a limit constraint like this
      // We'll fetch and slice in JS
    }

    const q = query(collection(db, PROGRESS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    const records = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Progress))

    return limit ? records.slice(0, limit) : records
  } catch (error) {
    console.error('Error fetching goal progress:', error)
    throw error
  }
}

/**
 * Get progress for a date range
 */
export async function getProgressByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Progress[]> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('loggedAt', '>=', startTimestamp),
      where('loggedAt', '<=', endTimestamp),
      orderBy('loggedAt', 'desc'),
    ]

    const q = query(collection(db, PROGRESS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Progress))
  } catch (error) {
    console.error('Error fetching progress by date range:', error)
    throw error
  }
}

/**
 * Subscribe to real-time progress updates for a goal
 */
export function subscribeToGoalProgress(
  goalId: string,
  callback: (progress: Progress[]) => void
): () => void {
  const q = query(
    collection(db, PROGRESS_COLLECTION),
    where('goalId', '==', goalId),
    orderBy('loggedAt', 'desc')
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        // Convert Firestore Timestamps to JS Dates
        loggedAt: data.loggedAt?.toDate ? data.loggedAt.toDate() : new Date(data.loggedAt),
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
      } as Progress
    })
    callback(records)
  })

  return unsubscribe
}

/**
 * Update a progress record (e.g., edit amount or notes)
 */
export async function updateProgress(
  progressId: string,
  updates: Partial<Omit<Progress, 'id' | 'userId' | 'goalId' | 'timestamp'>>
): Promise<void> {
  try {
    const progressRef = doc(db, PROGRESS_COLLECTION, progressId)
    await updateDoc(progressRef, updates)
  } catch (error) {
    console.error('Error updating progress:', error)
    throw error
  }
}

/**
 * Revert a progress record (mark as reverted instead of deleting)
 */
export async function revertProgress(
  progressId: string,
  revertedBy: string
): Promise<void> {
  try {
    const progressRef = doc(db, PROGRESS_COLLECTION, progressId)
    await updateDoc(progressRef, {
      revertedBy,
      revertedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error reverting progress:', error)
    throw error
  }
}

/**
 * Permanently delete a progress record
 */
export async function deleteProgress(progressId: string): Promise<void> {
  try {
    const progressRef = doc(db, PROGRESS_COLLECTION, progressId)
    await deleteDoc(progressRef)
  } catch (error) {
    console.error('Error deleting progress:', error)
    throw error
  }
}

/**
 * Calculate total progress for a goal within a date range
 */
export async function calculateGoalProgress(
  goalId: string,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const constraints: QueryConstraint[] = [
      where('goalId', '==', goalId),
      where('userId', '==', userId),
      where('loggedAt', '>=', startTimestamp),
      where('loggedAt', '<=', endTimestamp),
    ]

    const q = query(collection(db, PROGRESS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    console.log('[calculateGoalProgress]', {
      goalId,
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recordsFound: snapshot.docs.length,
      records: snapshot.docs.map(doc => ({
        value: doc.get('value'),
        loggedAt: doc.get('loggedAt')?.toDate?.()?.toISOString() || doc.get('loggedAt'),
        revertedBy: doc.get('revertedBy'),
      }))
    })
    
    return snapshot.docs.reduce((total, doc) => {
      const revertedBy = doc.get('revertedBy')
      // Exclude reverted records
      return revertedBy ? total : total + doc.get('value')
    }, 0)
  } catch (error) {
    console.error('Error calculating goal progress:', error)
    throw error
  }
}

/**
 * Get all user progress records (for analytics)
 */
export async function getUserProgress(userId: string): Promise<Progress[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('loggedAt', 'desc'),
    ]

    const q = query(collection(db, PROGRESS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Progress))
  } catch (error) {
    console.error('Error fetching user progress:', error)
    throw error
  }
}
