import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>Data Collection</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We collect the information you provide directly to us when you create an account, build habits, and complete tasks. This data is securely stored in Firebase and used exclusively to synchronize your habit tracker across your devices.
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>Data Security</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Your data is protected by enterprise-grade security rules. We do not sell your personal data to third parties. Your habits, streaks, and account information remain private to you.
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>Changes to Policy</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the app.
        </Text>
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
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    marginBottom: 16,
  }
});
