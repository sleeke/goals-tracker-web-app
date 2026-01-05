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
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Goal } from '@/types'

const GOALS_COLLECTION = 'goals'

/**
 * Get all goals for the current user
 */
export async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)]
    const q = query(collection(db, GOALS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal))
  } catch (error) {
    console.error('Error fetching user goals:', error)
    throw error
  }
}

/**
 * Subscribe to real-time updates of user's goals
 */
export function subscribeToUserGoals(
  userId: string,
  callback: (goals: Goal[]) => void
): () => void {
  const q = query(collection(db, GOALS_COLLECTION), where('userId', '==', userId))
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal))
    callback(goals)
  })

  return unsubscribe
}

/**
 * Create a new goal
 */
export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
  try {
    const docRef = await addDoc(collection(db, GOALS_COLLECTION), {
      ...goalData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return {
      ...goalData,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Goal
  } catch (error) {
    console.error('Error creating goal:', error)
    throw error
  }
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId)
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

/**
 * Delete a goal and all its progress records
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goalRef = doc(db, GOALS_COLLECTION, goalId)
    await deleteDoc(goalRef)
    
    // Note: Progress records should be deleted separately or via Firebase Rules
    // to maintain data integrity
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

/**
 * Archive a goal (mark as completed without deleting)
 */
export async function archiveGoal(goalId: string): Promise<void> {
  try {
    await updateGoal(goalId, { status: 'archived' })
  } catch (error) {
    console.error('Error archiving goal:', error)
    throw error
  }
}

/**
 * Get a single goal by ID
 */
export async function getGoal(goalId: string): Promise<Goal | null> {
  try {
    const q = query(collection(db, GOALS_COLLECTION), where('id', '==', goalId))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      ...doc.data(),
      id: doc.id,
    } as Goal
  } catch (error) {
    console.error('Error fetching goal:', error)
    throw error
  }
}

/**
 * Get goals by frequency (daily, weekly, monthly)
 */
export async function getGoalsByFrequency(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly'
): Promise<Goal[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('frequency', '==', frequency),
    ]
    const q = query(collection(db, GOALS_COLLECTION), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal))
  } catch (error) {
    console.error('Error fetching goals by frequency:', error)
    throw error
  }
}
