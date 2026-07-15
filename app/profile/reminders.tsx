import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../src/services/db';

export default function RemindersScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const habits = useStore((state) => state.habits);
  const theme = isDarkMode ? colors.dark : colors.light;

  // Local state to simulate toggling reminders
  const [activeReminders, setActiveReminders] = useState<Record<string, boolean>>(
    habits.reduce((acc, habit) => {
      if (habit.id) acc[habit.id] = true; // defaulting to true for mockup visual
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleReminder = (habitId: string) => {
    setActiveReminders(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Reminders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No habits to set reminders for.
          </Text>
        ) : (
          habits.map((habit) => {
            const isActive = activeReminders[habit.id as string];
            return (
              <View key={habit.id} style={[styles.reminderCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.iconContainer, { backgroundColor: habit.color || theme.primary + '20' }]}>
                  <Ionicons name={(habit.icon as any) || "water-outline"} size={24} color={habit.color || theme.primary} />
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                  <Text style={[styles.habitTime, { color: theme.textSecondary }]}>
                    {habit.frequency} - {habit.reminderTime || '09:00 AM'}
                  </Text>
                </View>

                <Switch
                  value={isActive}
                  onValueChange={() => habit.id && toggleReminder(habit.id)}
                  trackColor={{ false: '#767577', true: theme.primary + '80' }}
                  thumbColor={isActive ? theme.primary : '#f4f3f4'}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={() => router.push('/habit/add')}
        >
          <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  habitName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    marginBottom: 4,
  },
  habitTime: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 0, // optional border
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.fonts.semiBold,
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
  }
});
