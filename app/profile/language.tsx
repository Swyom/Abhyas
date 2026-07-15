import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { id: 'en', name: 'English (US)' },
  { id: 'es', name: 'Español' },
  { id: 'fr', name: 'Français' },
  { id: 'de', name: 'Deutsch' },
  { id: 'hi', name: 'Hindi (हिन्दी)' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Local state for demonstration
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Language</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.listContainer, { backgroundColor: theme.surface }]}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity 
              key={lang.id} 
              style={[
                styles.languageItem,
                index !== LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
              onPress={() => setSelectedLanguage(lang.id)}
            >
              <Text style={[
                styles.languageText, 
                { color: theme.text },
                selectedLanguage === lang.id && { fontFamily: typography.fonts.semiBold, color: theme.primary }
              ]}>
                {lang.name}
              </Text>
              {selectedLanguage === lang.id && (
                <Ionicons name="checkmark" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: { padding: 4, marginLeft: -4 },
  headerTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
  },
  scrollContent: { padding: 24 },
  listContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  languageText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
  }
});
