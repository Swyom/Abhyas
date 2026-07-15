import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { format } from 'date-fns';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getUserHabits, Habit, updateHabit, deleteHabit, syncUserGlobalStreak } from '../../src/services/db'; // Ensure deleteHabit is imported
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  const user = useStore((state) => state.user);
  const habits = useStore((state) => state.habits);
  const setHabits = useStore((state) => state.setHabits);
  const setUser = useStore((state) => state.setUser);
  
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [user?.uid, user?.createdAt])
  );

  const fetchHabits = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await getUserHabits(user.uid);
    if (result.success && result.habits) {
      setHabits(result.habits);
      
      // Sync global streak on load to catch missed days
      const streakRes = await syncUserGlobalStreak(user.uid, result.habits, user.createdAt || new Date().toISOString());
      if (streakRes.success) {
        if (user.currentStreak !== streakRes.currentStreak || user.longestStreak !== streakRes.longestStreak) {
          setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });
        }
      }
    } else {
      Alert.alert('Database Error', result.error || 'Could not fetch your habits.');
    }
    setLoading(false);
  };

  const [today, setToday] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [todayDayIndex, setTodayDayIndex] = useState(new Date().getDay());

  // Automatically refresh the day if the user leaves the app open exactly at midnight
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTodayStr = format(new Date(), 'yyyy-MM-dd');
      if (currentTodayStr !== today) {
        setToday(currentTodayStr);
        setTodayDayIndex(new Date().getDay());
      }
    }, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [today]);
  const todaysHabits = habits.filter(h => {
    if (!h.frequencyDays || h.frequencyDays.length === 0) return true; 
    return h.frequencyDays.includes(todayDayIndex);
  });

  const completedToday = todaysHabits.filter(h => h.history && h.history[today]).length;
  const progress = todaysHabits.length > 0 ? (completedToday / todaysHabits.length) * 100 : 0;

  const getIconName = (icon: string) => {
    // Map both old custom names and previous MaterialIcons to the new Emoji list
    const legacyMap: Record<string, string> = {
      'couple': '❤️', 'couple_date': '❤️', 'cycling': '🚴',
      'groceries': '🛒', 'gym': '💪', 'health': '❤️',
      'lunch': '🥗', 'medicine': '💊', 'meditation': '🧘',
      'mobile': '📱', 'party': '🎉', 'prayer': '🙏',
      'shopping': '🛒', 'study': '📚', 'tea': '☕️',
      'water': '💧', 'writing': '✍️', 'yoga': '🧘',
      'fitness-center': '💪', 'local-drink': '💧', 'menu-book': '📚',
      'directions-run': '🏃‍♂️', 'local-cafe': '☕️', 'medication': '💊',
      'self-improvement': '🧘', 'shopping-cart': '🛒', 'favorite': '❤️',
      'restaurant': '🥗', 'celebration': '🎉', 'pedal-bike': '🚴',
      'smartphone': '📱', 'church': '🙏'
    };
    return legacyMap[icon] || icon || '💪';
  };

  const toggleHabit = async (habit: Habit) => {
    // If it was completed (true), toggle to unmarked (undefined). If unmarked or explicitly incomplete (false), toggle to completed (true).
    const currentStatus = habit.history?.[today];
    const newStatus = currentStatus === true ? undefined : true;
    
    // Copy history and remove key if undefined, else set value
    const newHistory = { ...habit.history };
    if (newStatus === undefined) {
      delete newHistory[today];
    } else {
      newHistory[today] = newStatus;
    }

    const updatedHabit = { ...habit, history: newHistory };
    const newHabitsList = habits.map(h => h.id === habit.id ? updatedHabit : h);
    setHabits(newHabitsList);

    if (habit.id && user?.uid) {
      const result = await updateHabit(user.uid, habit.id, { history: newHistory });
      if (!result.success) {
        setHabits(habits);
      } else {
        const streakRes = await syncUserGlobalStreak(user.uid, newHabitsList, user.createdAt || new Date().toISOString());
        if (streakRes.success) setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });
      }
    }
  };

  const handleDelete = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to remove "${habit.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (!habit.id || !user?.uid) return;
            
            // Optimistic Update: Remove from local array state immediately
            const originalHabits = [...habits];
            const newHabitsList = habits.filter(h => h.id !== habit.id);
            setHabits(newHabitsList);

            const result = await deleteHabit(user.uid, habit.id);
            if (!result.success) {
              Alert.alert('Error', 'Failed to delete the habit. Please try again.');
              setHabits(originalHabits); // Revert if database save fails
            } else {
              const streakRes = await syncUserGlobalStreak(user.uid, newHabitsList, user.createdAt || new Date().toISOString());
              if (streakRes.success) setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Good Morning,</Text>
            <Text style={[styles.name, { color: theme.text }]}>{user?.fullName || user?.displayName || 'User'} 👋</Text>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Let's build some great habits today!</Text>
          </View>
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person-circle" size={28} color={theme.textSecondary} />
            </View>
          )}
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>Daily Progress</Text>
            <Text style={[styles.progressValue, { color: theme.primary }]}>{Math.round(progress)}% <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>Completed</Text></Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={80} height={80}>
              <Circle
                cx={40}
                cy={40}
                r={32}
                stroke={theme.border}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={40}
                cy={40}
                r={32}
                stroke={theme.primary}
                strokeWidth={8}
                fill="none"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 - (Math.min(progress, 100) / 100) * (2 * Math.PI * 32)}
                strokeLinecap={progress >= 100 ? "butt" : "round"}
                transform="rotate(-90 40 40)"
              />
            </Svg>
            <View style={{ position: 'absolute' }}>
              <Text style={[styles.progressRingText, { color: theme.text }]}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </View>

        {/* Today's Habits */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Habits</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{completedToday}/{todaysHabits.length} Completed</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : todaysHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.textSecondary }}>No habits scheduled for today. Take a rest or add a new one!</Text>
          </View>
        ) : (
          todaysHabits.map((habit) => {
            const isCompleted = habit.history?.[today];
            return (
              <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: (habit.color || theme.primary) + '20' }]}>
                  <Text style={{ fontSize: 24 }}>
                    {getIconName(habit.icon)}
                  </Text>
                </View>
                
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                  <Text style={[styles.habitDesc, { color: theme.textSecondary }]}>{habit.description || habit.frequency}</Text>
                </View>

                {/* Integrated Action Row (Delete & Checkbox Toggle) */}
                <View style={styles.actionContainer}>
                  <TouchableOpacity 
                    onPress={() => handleDelete(habit)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  > 
                  {/* @ts-ignore */}
                    <Ionicons name="trash-outline" size={20} color={colors.common?.danger || '#FF4D4D'} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => toggleHabit(habit)}
                    style={[styles.checkButton, { 
                      backgroundColor: isCompleted ? theme.success : 'transparent',
                      borderColor: isCompleted ? theme.success : theme.border
                    }]}
                  >
                    {isCompleted && <Ionicons name="checkmark" size={18} color="#FFF" />}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
  },
  name: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    marginBottom: 8,
  },
  progressValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
  },
  progressSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  progressRingText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
  },
  sectionSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
    marginRight: 8,
  },
  habitName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    marginBottom: 4,
  },
  habitDesc: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});