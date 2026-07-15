import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FireSVG from '../../assets/Fire.svg';
import { BarChart } from 'react-native-chart-kit';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { subDays, format } from 'date-fns';

// Helper function to convert any hex color to an explicit rgba values format required by react-native-chart-kit
const hexToRgbStr = (hex: string): string => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '98, 0, 238'; // Fallback purple
};

export default function StatisticsScreen() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  const user = useStore((state) => state.user);
  const habits = useStore((state) => state.habits);


  // Calculate stats
  let totalCompletedAllTime = 0;
  
  // Weekly stats for the bar chart
  const weekDays = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  const weekStats = weekDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayIndex = date.getDay();
    const scheduledHabits = habits.filter(h => !h.frequencyDays || h.frequencyDays.length === 0 || h.frequencyDays.includes(dayIndex));
    
    const completed = scheduledHabits.filter(h => h.history?.[dateStr]).length;
    return {
      day: format(date, 'E'),
      completed,
      total: scheduledHabits.length,
    };
  });

  habits.forEach(habit => {
    totalCompletedAllTime += Object.values(habit.history || {}).filter(Boolean).length;
  });

  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;

  const habitsCompletedThisWeek = weekStats.reduce((sum, day) => sum + day.completed, 0);
  const totalPossibleThisWeek = weekStats.reduce((sum, day) => sum + day.total, 0) || 1;
  const completionRate = Math.round((habitsCompletedThisWeek / totalPossibleThisWeek) * 100);

  const achievements = [
    {
      id: 'first_step',
      title: 'First Step',
      desc: 'Complete your first habit',
      icon: 'medal',
      color: '#FFC107',
      isUnlocked: totalCompletedAllTime >= 1,
    },
    {
      id: 'streak_3',
      title: 'Getting Started',
      desc: 'Reach a 3-day global streak',
      icon: 'flame',
      color: '#FF5722',
      isUnlocked: longestStreak >= 3,
    },
    {
      id: 'streak_7',
      title: 'Consistency King',
      desc: 'Reach a 7-day global streak',
      icon: 'star',
      color: '#4CAF50',
      isUnlocked: longestStreak >= 7,
    },
    {
      id: 'streak_30',
      title: 'Unstoppable',
      desc: 'Reach a 30-day global streak',
      icon: 'trophy',
      color: '#9C27B0',
      isUnlocked: longestStreak >= 30,
    },
    {
      id: 'habit_builder',
      title: 'Habit Builder',
      desc: 'Create 5 habits',
      icon: 'construct',
      color: '#2196F3',
      isUnlocked: habits.length >= 5,
    },
    {
      id: 'century',
      title: 'Century Club',
      desc: 'Complete 100 habits total',
      icon: 'diamond',
      color: '#00BCD4',
      isUnlocked: totalCompletedAllTime >= 100,
    }
  ];

  const primaryRgb = hexToRgbStr(theme.primary || '#4CAF50');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Streaks</Text>
        </View>

        {/* Streaks Overview Card */}
        <View style={[styles.streakCard, { backgroundColor: theme.surface }]}>
          <View style={styles.currentStreakContainer}>
            <View style={styles.fireSvgWrapper} pointerEvents="none">
              <FireSVG width="100%" height="100%" />
            </View>
            <Text style={[styles.currentStreakValue, { color: theme.text }]}>{currentStreak} Days</Text>
            <Text style={[styles.currentStreakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
            <Text style={[styles.currentStreakSub, { color: theme.textSecondary }]}>Keep it up! You're on fire!</Text>
          </View>
          
          <View style={[styles.streakDivider, { backgroundColor: theme.border }]} />
          
          <View style={styles.streakStatsRow}>
            <View style={styles.streakStatBox}>
              <Text style={[styles.streakStatLabel, { color: theme.textSecondary }]}>Largest Streak</Text>
              <Text style={[styles.streakStatValue, { color: theme.text }]}>{longestStreak} Days</Text>
            </View>
            <View style={styles.streakStatBox}>
              <Text style={[styles.streakStatLabel, { color: theme.textSecondary }]}>Total Habits</Text>
              <Text style={[styles.streakStatValue, { color: theme.text }]}>{habits.length}</Text>
            </View>
          </View>
        </View>

        {/* Statistics Section Header */}
        <View style={[styles.header, { marginTop: 32 }]}>
          <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>
          <TouchableOpacity style={[styles.dropdown, { backgroundColor: theme.surface }]}>
            <Text style={[styles.dropdownText, { color: theme.text }]}>This Week</Text>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} style={{ marginLeft: 4 }}/>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statBoxLabel, { color: theme.textSecondary }]}>Habits Completed</Text>
            <Text style={[styles.statBoxValue, { color: theme.text }]}>{habitsCompletedThisWeek}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statBoxLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
            <Text style={[styles.statBoxValue, { color: theme.text }]}>{completionRate}%</Text>
          </View>
        </View>

        {/* React Native Chart Kit Bar Chart Wrapper */}
        <View style={[styles.chartWrapperCard, { backgroundColor: theme.surface }]}>
          <BarChart
            data={{
              labels: weekStats.map(s => s.day.charAt(0)),
              datasets: [{
                data: weekStats.map(s => s.total > 0 ? (s.completed / s.total) * 100 : 0)
              }]
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            fromZero={true}
            segments={4}
            chartConfig={{
              backgroundGradientFrom: theme.surface,
              backgroundGradientFromOpacity: 0,
              backgroundGradientTo: theme.surface,
              backgroundGradientToOpacity: 0,
              fillShadowGradientOpacity: 1,
              fillShadowGradientToOpacity: 1,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${primaryRgb}, ${opacity})`,
              labelColor: () => theme.textSecondary,
              barPercentage: 0.5,
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: theme.border,
                strokeDasharray: '0', 
              },
              propsForLabels: {
                fontFamily: typography.fonts.medium,
                fontSize: 12,
              },
            }}
            style={styles.chartInlineStyle}
            showValuesOnTopOfBars={true}
          />
        </View>

        {/* Habit Completion Progress */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Habit Completion</Text>
        
        {habits.length === 0 ? (
          <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No habits to show statistics for.</Text>
        ) : (
          habits.map((habit, i) => {
            const completedCount = Object.values(habit.history || {}).filter(Boolean).length;
            const creationDate = new Date(habit.createdAt || Date.now());
            const daysSinceCreation = Math.max(1, Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24)));
            const progress = Math.min((completedCount / daysSinceCreation) * 100, 100); 
            
            return (
              <View key={habit.id || i} style={styles.habitProgressItem}>
                <View style={styles.habitProgressHeader}>
                  <Text style={[styles.habitProgressName, { color: theme.text }]}>{habit.name}</Text>
                  <Text style={[styles.habitProgressCount, { color: theme.textSecondary }]}>{completedCount}/{daysSinceCreation}</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: habit.color || theme.primary, width: `${progress}%` }]} />
                </View>
              </View>
            );
          })
        )}
        
        {/* Achievements Section */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Achievements</Text>
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => {
            const isUnlocked = achievement.isUnlocked;
            const iconColor = isUnlocked ? achievement.color : theme.textSecondary;
            const iconBg = isUnlocked ? `${achievement.color}25` : theme.border;
            
            return (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard, 
                  { backgroundColor: theme.surface, opacity: isUnlocked ? 1 : 0.6 }
                ]}
              >
                <View style={[styles.achievementIconBox, { backgroundColor: iconBg }]}>
                  <Ionicons name={achievement.icon as any} size={22} color={iconColor} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: theme.text }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>
                    {achievement.desc}
                  </Text>
                </View>
                {isUnlocked ? (
                  <Ionicons name="checkmark-circle" size={24} color={theme.success || '#4CAF50'} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
                )}
              </View>
            );
          })}
        </View>

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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dropdownText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  streakCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  currentStreakContainer: {
    alignItems: 'center',
    width: '100%',
  },
  fireSvgWrapper: {
    width: 100,
    height: 100,
    marginBottom: 4,
  },
  currentStreakValue: {
    fontFamily: typography.fonts.bold,
    fontSize: 34,
  },
  currentStreakLabel: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  currentStreakSub: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    marginTop: 6,
  },
  streakDivider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  streakStatsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  streakStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  streakStatLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    marginBottom: 6,
  },
  streakStatValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
  },
  statBoxLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    marginBottom: 6,
  },
  statBoxValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
  },
  chartWrapperCard: {
    marginTop: 24,
    borderRadius: 20,
    paddingVertical: 20,
    paddingLeft: 6,
    paddingRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInlineStyle: {
    marginVertical: 0,
    borderRadius: 20,
    marginRight: -15, 
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    marginBottom: 16,
  },
  habitProgressItem: {
    marginBottom: 20,
  },
  habitProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  habitProgressName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
  },
  habitProgressCount: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  achievementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    marginBottom: 2,
  },
  achievementDesc: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
});