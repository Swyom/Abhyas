import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { createHabit } from '../../src/services/db';
import { sendTestNotification } from '../../src/services/notifications';

const EMOJI_LIST = [
  '💪', '💧', '📚', '🏃‍♂️', '☕️', '💊', '🧘', '🛒', '❤️', '🥗',
  '🎉', '🚴', '📱', '🙏', '✍️', '🧹', '🌱', '🎨', '🧠', '💤',
  '🚭', '💵', '🎸', '💻', '🗣', '🐕', '🦷', '🍎', '💦', '⏰'
];

const EMOJI_KEYWORD_MAP: { [key: string]: string[] } = {
  '💪': ['gym', 'workout', 'train', 'exercise', 'fit', 'lift', 'muscle', 'strength'],
  '💧': ['water', 'drink', 'hydrate', 'hydration'],
  '📚': ['read', 'book', 'study', 'learn', 'course', 'exam', 'paper'],
  '🏃‍♂️': ['run', 'jog', 'cardio', 'walk', 'step', 'sprint'],
  '☕️': ['coffee', 'tea', 'cafe', 'morning'],
  '💊': ['pill', 'med', 'vitamin', 'supplement', 'doctor'],
  '🧘': ['meditate', 'yoga', 'stretch', 'breathe', 'mindful', 'calm'],
  '🛒': ['shop', 'grocery', 'buy', 'store'],
  '❤️': ['health', 'love', 'selfcare', 'care', 'relationship'],
  '🥗': ['diet', 'eat', 'healthy', 'salad', 'food', 'meal'],
  '🎉': ['celebrate', 'fun', 'party', 'reward'],
  '🚴': ['bike', 'cycle', 'ride', 'spin'],
  '📱': ['screen', 'phone', 'social', 'scroll', 'app'],
  '🙏': ['pray', 'gratitude', 'church', 'worship', 'thank'],
  '✍️': ['write', 'journal', 'diary', 'blog', 'note'],
  '🧹': ['clean', 'sweep', 'wash', 'tidy', 'room', 'house', 'chore'],
  '🌱': ['garden', 'plant', 'grow', 'nature'],
  '🎨': ['draw', 'paint', 'sketch', 'art', 'creative', 'design'],
  '🧠': ['think', 'focus', 'brain', 'puzzle', 'memory'],
  '💤': ['sleep', 'bed', 'rest', 'nap'],
  '🚭': ['smoke', 'quit', 'tobacco', 'vape'],
  '💵': ['save', 'budget', 'money', 'finance', 'spend'],
  '🎸': ['music', 'guitar', 'piano', 'sing', 'instrument', 'practice'],
  '💻': ['code', 'program', 'work', 'develop', 'computer', 'screen'],
  '🗣': ['speak', 'language', 'talk', 'socialize', 'call'],
  '🐕': ['dog', 'pet', 'cat', 'feed', 'walk dog'],
  '🦷': ['brush', 'floss', 'teeth', 'dentist'],
  '🍎': ['fruit', 'veg', 'breakfast', 'snack'],
  '💦': ['sweat', 'shower', 'cleanse'],
  '⏰': ['early', 'alarm', 'wake', 'routine']
};

const DAYS_OF_WEEK = [
  { label: 'Sun', short: 'S' },
  { label: 'Mon', short: 'M' },
  { label: 'Tue', short: 'T' },
  { label: 'Wed', short: 'W' },
  { label: 'Thu', short: 'T' },
  { label: 'Fri', short: 'F' },
  { label: 'Sat', short: 'S' }
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const user = useStore((state) => state.user);
  const habits = useStore((state) => state.habits);
  const setHabits = useStore((state) => state.setHabits);
  const theme = isDarkMode ? colors.dark : colors.light;

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([1, 3, 5]);
  const [selectedIcon, setSelectedIcon] = useState(EMOJI_LIST[0]);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate dynamic tile sizes responsive to screen widths
  const containerPadding = 48; // Left (24) + Right (24)
  const gapSize = 12; // Gap size between items
  const columns = 5;
  const tileWidth = (screenWidth - containerPadding - (gapSize * (columns - 1))) / columns;

  const handleNameChange = (text: string) => {
    setName(text);
    if (hasManuallySelected) return;

    const lowerText = text.toLowerCase();
    for (const [emoji, keywords] of Object.entries(EMOJI_KEYWORD_MAP)) {
      const match = keywords.some(keyword => lowerText.includes(keyword));
      if (match) {
        setSelectedIcon(emoji);
        break;
      }
    }
  };

  const handleEmojiPress = (emoji: string) => {
    setSelectedIcon(emoji);
    setHasManuallySelected(true);
  };

  const toggleDay = (dayIndex: number) => {
    if (frequencyDays.includes(dayIndex)) {
      setFrequencyDays(frequencyDays.filter(d => d !== dayIndex));
    } else {
      setFrequencyDays([...frequencyDays, dayIndex].sort());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (frequency === 'Custom' && frequencyDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for custom frequency');
      return;
    }

    setLoading(true);
    const newHabit = {
      userId: user.uid,
      name,
      description: '',
      frequency,
      frequencyDays: frequency === 'Custom' ? frequencyDays : [0, 1, 2, 3, 4, 5, 6],
      icon: selectedIcon,
      color: theme.primary,
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      totalCompleted: 0,
      history: {}
    };

    const result = await createHabit(newHabit);
    setLoading(false);

    if (result.success) {
      setHabits([{ ...newHabit, id: result.id } as any, ...habits]);
      router.back();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add New Habit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Habit Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="e.g., Read Book"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={handleNameChange}
          />
        </View>

        {/* Dynamic Emoji Grid Selector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Choose Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_LIST.map((emoji) => {
              const isSelected = selectedIcon === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiTile,
                    { 
                      backgroundColor: theme.surface,
                      width: tileWidth,
                      height: tileWidth
                    },
                    isSelected && { backgroundColor: theme.primary + '25', borderColor: theme.primary, borderWidth: 2 }
                  ]}
                  onPress={() => handleEmojiPress(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Cleaned up placeholder sizing to be responsive */}
            <View style={[styles.emojiTilePlaceholder, { width: tileWidth }]} />
            <View style={[styles.emojiTilePlaceholder, { width: tileWidth }]} />
            <View style={[styles.emojiTilePlaceholder, { width: tileWidth }]} />
            <View style={[styles.emojiTilePlaceholder, { width: tileWidth }]} />
          </View>
        </View>

        {/* Frequency Tabs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Frequency</Text>
          <View style={[styles.frequencyContainer, { backgroundColor: theme.surface }]}>
            {['Daily', 'Custom'].map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.freqButton,
                  frequency === f && { backgroundColor: theme.primary }
                ]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[
                  styles.freqButtonText,
                  { color: frequency === f ? '#FFF' : theme.text }
                ]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contextual Day Selection for Custom Frequency */}
          {frequency === 'Custom' && (
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day, index) => {
                const isSelected = frequencyDays.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: isSelected ? theme.primary : theme.surface }
                    ]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: isSelected ? '#FFF' : theme.textSecondary }
                    ]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Reminders Toggle Section */}
        <View style={[styles.reminderContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.reminderText, { color: theme.text }]}>Add Daily Reminder</Text>
          <Switch
            value={reminder}
            onValueChange={(val) => {
              setReminder(val);
              if (val) {
                sendTestNotification();
              }
            }}
            trackColor={{ false: '#767577', true: theme.primary + '80' }}
            thumbColor={reminder ? theme.primary : '#f4f3f4'}
          />
        </View>

        {/* Creation Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Add Habit'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20, // Clean, steady spacing across all inputs
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    marginBottom: 8,
  },
  input: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // Native uniform gap removes vertical height anomalies 
    marginTop: 4,
  },
  emojiTile: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiTilePlaceholder: {
    height: 0, // Zero out height so it takes no vertical space
  },
  emojiText: {
    fontSize: 24,
  },
  frequencyContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  freqButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqButtonText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  daysContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 42,
    marginHorizontal: 2,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  reminderText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.fonts.semiBold,
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
  }
});