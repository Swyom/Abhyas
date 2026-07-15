import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About App</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
            <Ionicons name="leaf" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Abhyas</Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.cardText, { color: theme.textSecondary }]}>
            Abhyas is designed to help you build positive habits and break negative ones. We believe that small, consistent actions lead to massive life changes.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Developer</Text>
          <Text style={[styles.cardText, { color: theme.textSecondary }]}>
            Built with ❤️ for those who want to be better every day.
          </Text>
          <Text style={[styles.cardText, { color: theme.textSecondary, marginTop: 8 }]}>
            Contact: swyom82@gmail.com
          </Text>
        </View>

        <Text style={[styles.copyright, { color: theme.textSecondary }]}>
          © 2026 Abhyas Habit Tracker. All rights reserved.
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xxl,
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    marginBottom: 8,
  },
  cardText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
  },
  copyright: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 20,
  }
});
