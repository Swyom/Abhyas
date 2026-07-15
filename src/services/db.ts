import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { calculateGlobalStreak } from '../utils/streaks';

const HABITS_COLLECTION = 'habits';

export interface Habit {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  frequency: string; // 'Daily', 'Weekly', 'Custom'
  frequencyDays?: number[]; // [0, 1, 2, 3, 4, 5, 6] for Sunday-Saturday
  reminderTime?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  history: Record<string, boolean>; // date string "YYYY-MM-DD" -> true/false
}

export const createHabit = async (habitData: Omit<Habit, 'id'>) => {
  try {
    const { userId } = habitData;
    const docRef = await addDoc(collection(db, `users/${userId}/habits`), habitData);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
  try {
    const habitRef = doc(db, `users/${userId}/habits`, habitId);
    await updateDoc(habitRef, updates);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteHabit = async (userId: string, habitId: string) => {
  try {
    await deleteDoc(doc(db, `users/${userId}/habits`, habitId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserHabits = async (userId: string) => {
  try {
    const q = query(
      collection(db, `users/${userId}/habits`),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const habits: Habit[] = [];
    querySnapshot.forEach((doc) => {
      habits.push({ id: doc.id, ...doc.data() } as Habit);
    });
    return { success: true, habits };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const syncUserGlobalStreak = async (userId: string, habits: Habit[], userCreatedAtStr: string) => {
  try {
    const { currentStreak, longestStreak } = calculateGlobalStreak(habits, userCreatedAtStr);
    
    // Also fetch the existing longest streak so we don't accidentally downgrade it
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    let finalLongest = longestStreak;
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.longestStreak && data.longestStreak > longestStreak) {
        finalLongest = data.longestStreak;
      }
    }

    await updateDoc(userRef, {
      currentStreak: currentStreak,
      longestStreak: finalLongest,
      lastActiveDate: new Date().toISOString().split('T')[0]
    });

    return { success: true, currentStreak, longestStreak: finalLongest };
  } catch (error: any) {
    console.error('Error syncing global streak:', error);
    return { success: false, error: error.message };
  }
};
