import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../src/services/auth';

const MENU_ITEMS = [
  { id: 'edit', title: 'Edit Profile', icon: 'pencil-outline' },
  { id: 'achievements', title: 'Achievements', icon: 'medal-outline' },
  { id: 'reminders', title: 'Reminders', icon: 'notifications-outline' },
  { id: 'settings', title: 'Settings', icon: 'settings-outline' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'about', title: 'About App', icon: 'information-circle-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isDarkMode = useStore((state) => state.isDarkMode);
  const user = useStore((state) => state.user);
  const habits = useStore((state) => state.habits);
  const theme = isDarkMode ? colors.dark : colors.light;

  // Adaptive breakpoints & scaling values
  const isTablet = windowWidth >= 768;
  const isSmallPhone = windowWidth < 360;
  
  const horizontalPadding = isTablet ? 40 : isSmallPhone ? 16 : 24;
  const maxContentWidth = isTablet ? 650 : '100%';
  const avatarSize = isTablet ? 110 : isSmallPhone ? 72 : 88;

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

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'edit':
        router.push('/profile/edit');
        break;
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'reminders':
        router.push('/profile/reminders');
        break;
      case 'achievements':
        router.navigate('/(tabs)/statistics');
        break;
      case 'help':
        Linking.openURL('mailto:swyom82@gmail.com?subject=Abhyas%20Support');
        break;
      case 'about':
        router.push('/profile/about');
        break;
      default:
        Alert.alert('Coming Soon', `${id} screen is under construction.`);
    }
  };

  // Compute total dynamic days since user account creation
  const getTotalDays = () => {
    if (!user?.createdAt) return 1;
    const createdDate = new Date(user.createdAt);
    const today = new Date();
    const differenceInTime = today.getTime() - createdDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays < 1 ? 1 : differenceInDays + 1;
  };

  const longestStreak = user?.longestStreak || 0;
  const totalDays = getTotalDays();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={[styles.responsiveWrapper, { maxWidth: maxContentWidth }]}>
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} 
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surface, width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
                <Ionicons name="person" size={avatarSize * 0.45} color={theme.textSecondary} />
              </View>
            )}
            <Text style={[styles.name, { color: theme.text, fontSize: isTablet ? typography.sizes.xxl : typography.sizes.xl }]}>
              {user?.fullName || user?.displayName || 'User'}
            </Text>
            <Text style={[styles.email, { color: theme.textSecondary, fontSize: isTablet ? typography.sizes.md : typography.sizes.sm }]}>
              {user?.email || 'No email'}
            </Text>
            {user?.bio ? (
              <Text style={[styles.bio, { color: theme.textSecondary, fontSize: isTablet ? typography.sizes.md : typography.sizes.sm }]}>
                {user.bio}
              </Text>
            ) : null}
          </View>

          {/* Stats Row */}
          <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontSize: isTablet ? typography.sizes.xl : typography.sizes.lg }]}>
                {totalDays}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: isTablet ? typography.sizes.sm : typography.sizes.xs }]}>
                Total Days
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontSize: isTablet ? typography.sizes.xl : typography.sizes.lg }]}>
                {longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: isTablet ? typography.sizes.sm : typography.sizes.xs }]}>
                Longest Streak
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontSize: isTablet ? typography.sizes.xl : typography.sizes.lg }]}>
                {habits.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: isTablet ? typography.sizes.sm : typography.sizes.xs }]}>
                Total Habits
              </Text>
            </View>
          </View>

          {/* How It Works Manual Card */}
          <View style={[styles.manualContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.manualTitle, { color: theme.text, fontSize: isTablet ? typography.sizes.lg : typography.sizes.md }]}>
              💡 How Abhyas Works
            </Text>
            
            <View style={styles.manualStep}>
              <Ionicons name="add-circle-outline" size={18} color={theme.text} style={styles.manualStepIcon} />
              <Text style={[styles.manualText, { color: theme.textSecondary, fontSize: typography.sizes.sm }]}>
                <Text style={styles.boldText}>Create Habits:</Text> Head over to the dashboard tab and hit the add button to target daily or weekly commitments.
              </Text>
            </View>

            <View style={styles.manualStep}>
              <Ionicons name="checkmark-done-circle-outline" size={18} color={theme.text} style={styles.manualStepIcon} />
              <Text style={[styles.manualText, { color: theme.textSecondary, fontSize: typography.sizes.sm }]}>
                <Text style={styles.boldText}>Log Progress:</Text> Tap a habit checkbox once complete to record execution data to your history logs.
              </Text>
            </View>

            <View style={styles.manualStep}>
              <Ionicons name="flame-outline" size={18} color={theme.text} style={styles.manualStepIcon} />
              <Text style={[styles.manualText, { color: theme.textSecondary, fontSize: typography.sizes.sm }]}>
                <Text style={styles.boldText}>Protect Streaks:</Text> Keep logging completions consistently every day to grow your active streak matrix.
              </Text>
            </View>

            <View style={styles.manualStep}>
              <Ionicons name="bar-chart-outline" size={18} color={theme.text} style={styles.manualStepIcon} />
              <Text style={[styles.manualText, { color: theme.textSecondary, fontSize: typography.sizes.sm }]}>
                <Text style={styles.boldText}>Analyze:</Text> Tap the Statistics tab at any point to track historical success metrics and long-term milestones.
              </Text>
            </View>
          </View>

          {/* Menu List Container Card */}
          <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.menuItem, 
                  index !== MENU_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }
                ]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={isTablet ? 24 : 22} color={theme.textSecondary} style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: theme.text, fontSize: isTablet ? typography.sizes.lg : typography.sizes.md }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={isTablet ? 22 : 20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.surface }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: theme.error, fontSize: isTablet ? typography.sizes.lg : typography.sizes.md }]}>
              Logout
            </Text>
          </TouchableOpacity>

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
    paddingVertical: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: typography.fonts.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
  },
  bio: {
    fontFamily: typography.fonts.regular,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: typography.fonts.medium,
    lineHeight: 16,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    opacity: 0.6,
  },
  manualContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  manualTitle: {
    fontFamily: typography.fonts.bold,
    marginBottom: 14,
  },
  manualStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  manualStepIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  manualText: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  boldText: {
    fontFamily: typography.fonts.semiBold,
  },
  menuContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 14,
  },
  menuText: {
    fontFamily: typography.fonts.medium,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: typography.fonts.semiBold,
  }
});