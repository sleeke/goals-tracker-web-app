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
  amount: number,
  notes?: string,
  loggedAt?: Date,
  isRetroactive?: boolean
): Promise<Progress> {
  try {
    const progressRef = await addDoc(collection(db, PROGRESS_COLLECTION), {
      goalId,
      userId,
      amount,
      notes: notes || '',
      timestamp: Timestamp.now(),
      loggedAt: loggedAt ? Timestamp.fromDate(loggedAt) : Timestamp.now(),
      isRetroactive: isRetroactive || false,
      revertedBy: null,
    })

    return {
      id: progressRef.id,
      goalId,
      userId,
      amount,
      notes: notes || '',
      timestamp: new Date(),
      loggedAt: loggedAt || new Date(),
      isRetroactive: isRetroactive || false,
      revertedBy: null,
    } as unknown as Progress
  } catch (error) {
    console.error('Error logging progress:', error)
    throw error
  }
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
    const records = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Progress))
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
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate)
    const endTimestamp = Timestamp.fromDate(endDate)

    const constraints: QueryConstraint[] = [
      where('goalId', '==', goalId),
      where('loggedAt', '>=', startTimestamp),
      where('loggedAt', '<=', endTimestamp),
    ]

    const q = query(collection(db, PROGRESS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.reduce((total, doc) => {
      const revertedBy = doc.get('revertedBy')
      // Exclude reverted records
      return revertedBy ? total : total + doc.get('amount')
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
