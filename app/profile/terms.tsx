import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          By accessing and using this app, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>2. User Account</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your account and password. We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>3. Use of Service</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Our habit tracking service is provided "as is". We are not responsible for any direct or indirect damages resulting from the use of our service.
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
