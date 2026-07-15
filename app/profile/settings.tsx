import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout } from '../../src/services/auth';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const theme = isDarkMode ? colors.dark : colors.light;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const renderSection = (children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      {children}
    </View>
  );

  const renderToggleRow = (label: string, value: boolean, onValueChange: (v: boolean) => void, isLast = false) => (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {/* @ts-ignore */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: theme.primary + '80' }}
        thumbColor={value ? theme.primary : '#f4f3f4'}
      />
    </View>
  );

  const renderNavRow = (label: string, value?: string, isLast = false, onPress?: () => void) => (
    <TouchableOpacity 
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
  );

  const handleRate = () => {
    const url = Platform.OS === 'ios' ? 'itms-apps://itunes.apple.com/app/id123456789' : 'market://details?id=com.yourapp.id';
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Store app not found');
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {renderSection(
          <>
            {renderToggleRow('Dark Mode', isDarkMode, toggleTheme)}
            {renderToggleRow('Notifications', notificationsEnabled, setNotificationsEnabled, true)}
          </>
        )}

        {renderSection(
          <>
            {renderNavRow('Privacy Policy', undefined, false, () => router.push('/profile/privacy'))}
            {renderNavRow('Terms & Conditions', undefined, false, () => router.push('/profile/terms'))}
            {renderNavRow('Rate Us', undefined, true, handleRate)}
          </>
        )}

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
  }
});
