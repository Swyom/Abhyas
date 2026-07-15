import { Habit } from '../services/db';
import { format } from 'date-fns';

export function calculateHabitStreaks(habit: Habit) {
  if (!habit.history) return { currentStreak: 0, longestStreak: 0 };

  // Get all dates where the habit was explicitly marked as completed (true)
  const completedDates = Object.keys(habit.history)
    .filter(date => habit.history[date] === true)
    .sort(); // Sort chronologically

  if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const frequencyDays = habit.frequencyDays && habit.frequencyDays.length > 0 
    ? habit.frequencyDays 
    : [0, 1, 2, 3, 4, 5, 6]; // Default to daily if no frequencyDays

  // To calculate streaks considering non-scheduled days, we need to walk through the calendar.
  // A simpler approach for "longest streak" is to just count consecutive scheduled days that were completed.

  // Let's build a set of all completed date strings for fast lookup
  const completedSet = new Set(completedDates);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Find the first and last dates in history, or just start from the habit creation date up to today.
  // Actually, starting from the first recorded completion date is safer.
  const firstDateStr = completedDates[0];
  let currentDate = new Date(firstDateStr);
  
  // Set to midnight to avoid timezone issues
  currentDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Walk day by day from the first completion up to today
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    
    // Only care about days the habit is scheduled for
    if (frequencyDays.includes(dayOfWeek)) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      if (completedSet.has(dateStr)) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        // Break the streak
        tempStreak = 0;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // The tempStreak at the end of the loop is the current streak (up to today)
  // Wait, if today is not scheduled, the tempStreak carries over, which is correct.
  // But if today IS scheduled and not completed yet, technically the streak isn't broken UNTIL tomorrow.
  // For simplicity, if tempStreak > 0, we can call it currentStreak.
  
  // To strictly handle "did they break it today?"
  const todayDayOfWeek = today.getDay();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  if (frequencyDays.includes(todayDayOfWeek) && !completedSet.has(todayStr) && tempStreak === 0) {
     // If today was scheduled, not done, and streak broke, we look back to see if it broke today or earlier.
     // Actually the loop handled it. 
  }

  // Let's refine the loop to properly calculate currentStreak by looking BACKWARDS from today.
  let current = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today is scheduled and not done, it breaks the streak (or is just pending).
  // Often, apps allow "today" to be pending without breaking the streak.
  const cursorStr = format(cursor, 'yyyy-MM-dd');
  if (frequencyDays.includes(cursor.getDay()) && !completedSet.has(cursorStr)) {
    // Skip today for streak breaking purposes
    cursor.setDate(cursor.getDate() - 1);
  }

  // Look backwards for current streak
  while (true) {
    if (frequencyDays.includes(cursor.getDay())) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      if (completedSet.has(dateStr)) {
        current++;
      } else {
        break; // Streak broken
      }
    }
    cursor.setDate(cursor.getDate() - 1);
    
    // Failsafe: if we go before the first completed date
    if (cursor < new Date(firstDateStr)) {
      break;
    }
  }

  return {
    currentStreak: current,
    longestStreak: longestStreak
  };
}

export function calculateGlobalStreak(habits: Habit[], userCreatedAtStr: string) {
  if (habits.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // 1. Find the absolute earliest date to start from
  // We use the user's creation date, or the earliest recorded history date across all habits
  let earliestDateStr = userCreatedAtStr.split('T')[0];
  
  habits.forEach(h => {
    if (h.history) {
      const dates = Object.keys(h.history);
      if (dates.length > 0) {
        const minDate = dates.sort()[0];
        if (minDate < earliestDateStr) {
          earliestDateStr = minDate;
        }
      }
    }
  });

  const earliestDate = new Date(earliestDateStr);
  earliestDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  let currentDate = new Date(earliestDate);

  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // Find habits scheduled for this specific day
    const scheduledHabits = habits.filter(h => {
      const freq = h.frequencyDays && h.frequencyDays.length > 0 ? h.frequencyDays : [0, 1, 2, 3, 4, 5, 6];
      return freq.includes(dayOfWeek) && h.createdAt.split('T')[0] <= dateStr; 
      // Only count if the habit existed on this date
    });

    if (scheduledHabits.length > 0) {
      // Were ALL scheduled habits completed?
      const allCompleted = scheduledHabits.every(h => h.history && h.history[dateStr] === true);

      // Check if it's explicitly incomplete (any habit marked false)
      const explicitlyIncomplete = scheduledHabits.some(h => h.history && h.history[dateStr] === false);

      if (allCompleted) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        // If it's today and not all are completed, we just don't increment yet (streak is pending)
        // If it's explicitly incomplete TODAY, it breaks.
        // If it's a past day and not all completed, it breaks.
        if (dateStr < format(today, 'yyyy-MM-dd') || explicitlyIncomplete) {
          tempStreak = 0;
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // To perfectly reflect current streak looking backwards from today
  // (In case tempStreak got mangled or didn't account for pending today properly)
  let current = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayStr = format(cursor, 'yyyy-MM-dd');
  const todayScheduled = habits.filter(h => {
    const freq = h.frequencyDays && h.frequencyDays.length > 0 ? h.frequencyDays : [0, 1, 2, 3, 4, 5, 6];
    return freq.includes(cursor.getDay()) && h.createdAt.split('T')[0] <= todayStr;
  });

  const todayAllDone = todayScheduled.length > 0 && todayScheduled.every(h => h.history && h.history[todayStr] === true);
  const todayExplicitlyIncomplete = todayScheduled.some(h => h.history && h.history[todayStr] === false);

  if (todayScheduled.length > 0 && !todayAllDone && !todayExplicitlyIncomplete) {
    // Today is pending, don't penalize. Look at yesterday.
    cursor.setDate(cursor.getDate() - 1);
  }

  while (cursor >= earliestDate) {
    const dayOfWeek = cursor.getDay();
    const dateStr = format(cursor, 'yyyy-MM-dd');

    const scheduled = habits.filter(h => {
      const freq = h.frequencyDays && h.frequencyDays.length > 0 ? h.frequencyDays : [0, 1, 2, 3, 4, 5, 6];
      return freq.includes(dayOfWeek) && h.createdAt.split('T')[0] <= dateStr;
    });

    if (scheduled.length > 0) {
      const allDone = scheduled.every(h => h.history && h.history[dateStr] === true);
      if (allDone) {
        current++;
      } else {
        break; // Streak is broken
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longestStreak, current)
  };
}
