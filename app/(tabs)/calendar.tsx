import { Ionicons } from '@expo/vector-icons';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Image as RNImage, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import LaughSVG from '../../assets/Laugh.svg';
import { getUserHabits, updateHabit, syncUserGlobalStreak } from '../../src/services/db';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function CalendarScreen() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  const user = useStore((state) => state.user);
  const habits = useStore((state) => state.habits);
  const setHabits = useStore((state) => state.setHabits);
  const setUser = useStore((state) => state.setUser);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [showWebm, setShowWebm] = useState(false);
  const [showSvg, setShowSvg] = useState(false);

  const webmUri = RNImage.resolveAssetSource(require('../../assets/excellent.webm')).uri;

  useEffect(() => {
    if (habits.length === 0 && user) {
      fetchHabits();
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    setLoading(true);
    const result = await getUserHabits(user.uid);
    if (result.success && result.habits) {
      setHabits(result.habits);
    }
    setLoading(false);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getCompletionStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayIndex = date.getDay();
    
    const scheduledHabits = habits.filter(h => {
      if (!h.frequencyDays || h.frequencyDays.length === 0) return true;
      return h.frequencyDays.includes(dayIndex);
    });

    const total = scheduledHabits.length;
    if (total === 0) return { isDone: false, isNotDone: false, hasLogs: false };

    // Explicitly count items from database logs
    const completed = scheduledHabits.filter(h => h.history && h.history[dateStr] === true).length;
    const explicitlyIncomplete = scheduledHabits.filter(h => h.history && h.history[dateStr] === false).length;
    
    // Day counts as Done if there is at least 1 true mark and no false marks
    const isDone = completed > 0 && explicitlyIncomplete === 0;
    // Day counts as Not Done if explicitly flagged as false
    const isNotDone = explicitlyIncomplete > 0;

    return {
      isDone,
      isNotDone,
      hasLogs: completed > 0 || explicitlyIncomplete > 0
    };
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayIndex = selectedDate.getDay();

  const currentSelectedScheduledHabits = habits.filter(h => {
    if (!h.frequencyDays || h.frequencyDays.length === 0) return true;
    return h.frequencyDays.includes(selectedDayIndex);
  });

  const { isDone: selectedIsDone, isNotDone: selectedIsNotDone, hasLogs: selectedHasLogs } = getCompletionStatus(selectedDate);

  const handleCompleteAll = async () => {
    if (currentSelectedScheduledHabits.length === 0 || !user?.uid) return;

    const updatedHabits = habits.map(h => {
      if (!h.frequencyDays || h.frequencyDays.length === 0 || h.frequencyDays.includes(selectedDayIndex)) {
        return {
          ...h,
          history: { ...h.history, [selectedDateStr]: true }
        };
      }
      return h;
    });
    setHabits(updatedHabits);

    for (const habit of currentSelectedScheduledHabits) {
      if (habit.id) {
        const newHistory = { ...habit.history, [selectedDateStr]: true };
        await updateHabit(user.uid, habit.id, { history: newHistory });
      }
    }
    
    const streakRes = await syncUserGlobalStreak(user.uid, updatedHabits, user.createdAt || new Date().toISOString());
    if (streakRes.success) setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });

    setShowWebm(true);
    setTimeout(() => setShowWebm(false), 4000);
  };

  const handleIncompleteAll = async () => {
    if (currentSelectedScheduledHabits.length === 0 || !user?.uid) return;

    const updatedHabits = habits.map(h => {
      if (!h.frequencyDays || h.frequencyDays.length === 0 || h.frequencyDays.includes(selectedDayIndex)) {
        return {
          ...h,
          history: { ...h.history, [selectedDateStr]: false }
        };
      }
      return h;
    });
    setHabits(updatedHabits);

    for (const habit of currentSelectedScheduledHabits) {
      if (habit.id) {
        const newHistory = { ...habit.history, [selectedDateStr]: false };
        await updateHabit(user.uid, habit.id, { history: newHistory });
      }
    }

    const streakRes = await syncUserGlobalStreak(user.uid, updatedHabits, user.createdAt || new Date().toISOString());
    if (streakRes.success) setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });

    setShowSvg(true);
    setTimeout(() => setShowSvg(false), 4000);
  };

  const handleDeleteHistory = async () => {
    if (currentSelectedScheduledHabits.length === 0 || !user?.uid) return;

    const updatedHabits = habits.map(h => {
      if (h.history && h.history[selectedDateStr] !== undefined) {
        const newHistory = { ...h.history };
        delete newHistory[selectedDateStr];
        return { ...h, history: newHistory };
      }
      return h;
    });
    setHabits(updatedHabits);

    for (const habit of currentSelectedScheduledHabits) {
      if (habit.id && habit.history && habit.history[selectedDateStr] !== undefined) {
        const newHistory = { ...habit.history };
        delete newHistory[selectedDateStr];
        await updateHabit(user.uid, habit.id, { history: newHistory });
      }
    }
    
    const streakRes = await syncUserGlobalStreak(user.uid, updatedHabits, user.createdAt || new Date().toISOString());
    if (streakRes.success) setUser({ ...user, currentStreak: streakRes.currentStreak, longestStreak: streakRes.longestStreak });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Calendar Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Weekdays */}
        <View style={styles.weekDays}>
          {weekDays.map(day => (
            <Text key={day} style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {Array.from({ length: paddingDays }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {daysInMonth.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const { isDone, isNotDone } = getCompletionStatus(date);

            let cellBg = 'transparent';
            if (isSelected) {
              cellBg = theme.primary;
            } else if (isDone) {
              cellBg = theme.success + '25';
            } else if (isNotDone) {
              cellBg = (theme.error || '#EF4444') + '25';
            }

            return (
              <TouchableOpacity
                key={date.toString()}
                style={[styles.dayCell, { backgroundColor: cellBg }]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? '#FFF' : theme.text },
                  isToday && !isSelected && { color: theme.primary, fontFamily: typography.fonts.bold }
                ]}>
                  {format(date, 'd')}
                </Text>

                {/* Status indicators */}
                <View style={styles.indicatorContainer}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={11} color={isSelected ? '#FFF' : theme.success} />
                  ) : isNotDone ? (
                    <Ionicons name="close" size={11} color={isSelected ? '#FFF' : (theme.error || '#EF4444')} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Habits Action Center */}
        <View style={styles.selectedDateSection}>
          <Text style={[styles.selectedDateText, { color: theme.text }]}>
            {format(selectedDate, 'dd MMMM yyyy')}
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
          ) : habits.length === 0 ? (
            <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No habits tracking currently.</Text>
          ) : (
            <View style={styles.statusBoxesContainer}>
              <TouchableOpacity
                style={[
                  styles.statusBox,
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: selectedIsDone ? theme.success : theme.border,
                  },
                  selectedIsDone && { backgroundColor: theme.success + '15' }
                ]}
                onPress={handleCompleteAll}
              >
                <Ionicons name="checkmark-circle" size={32} color={selectedIsDone ? theme.success : theme.textSecondary} />
                <Text style={[styles.statusBoxText, { color: selectedIsDone ? theme.success : theme.text }]}>All Habits Completed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBox,
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: selectedIsNotDone ? (theme.error || '#EF4444') : theme.border,
                  },
                  selectedIsNotDone && { backgroundColor: (theme.error || '#EF4444') + '15' }
                ]}
                onPress={handleIncompleteAll}
              >
                <Ionicons name="close-circle" size={32} color={selectedIsNotDone ? (theme.error || '#EF4444') : theme.textSecondary} />
                <Text style={[styles.statusBoxText, { color: selectedIsNotDone ? (theme.error || '#EF4444') : theme.text }]}>Habits Not Completed</Text>
              </TouchableOpacity>

              {selectedHasLogs && (
                <TouchableOpacity
                  style={[
                    styles.statusBox,
                    { 
                      backgroundColor: theme.surface, 
                      borderColor: (theme.error || '#EF4444') + '50',
                      borderStyle: 'dashed'
                    }
                  ]}
                  onPress={handleDeleteHistory}
                >
                  <Ionicons name="trash-outline" size={32} color={theme.error || '#EF4444'} />
                  <Text style={[styles.statusBoxText, { color: theme.error || '#EF4444' }]}>Clear Status / Reset Logs</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Animation Overlays */}
      <Modal visible={showWebm} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowWebm(false)} activeOpacity={1}>
          <View style={{ width: 450, height: 450 }} pointerEvents="none">
            <WebView
              originWhitelist={['*']}
              source={{
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <style>
                    body { margin:0; padding:0; background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; }
                    video { max-width: 100%; max-height: 100%; object-fit: contain; }
                  </style>
                </head>
                <body>
                  <video autoplay playsinline muted>
                    <source src="${webmUri}" type="video/webm">
                  </video>
                </body>
                </html>
              `}}
              style={{ backgroundColor: 'transparent' }}
              scrollEnabled={false}
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSvg} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSvg(false)} activeOpacity={1}>
          <View style={{ width: 300, height: 300 }} pointerEvents="none">
              <LaughSVG width="100%" height="100%" />
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 24,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
  },
  dayText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  indicatorContainer: {
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedDateSection: {
    marginTop: 32,
  },
  selectedDateText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    marginBottom: 16,
  },
  statusBoxesContainer: {
    gap: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  statusBoxText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});