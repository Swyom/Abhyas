import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to show notifications even when app is in foreground
Notifications.setNotificationHandler({
  // @ts-ignore
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function scheduleHabitReminders() {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Cancel any existing scheduled notifications so we don't duplicate them
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule for 9:00 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Abhyas Habit Tracker',
      body: 'Complete your habits',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  // Schedule for 6:00 PM (18:00)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Abhyas Habit Tracker',
      body: 'Complete your habits',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

export async function sendTestNotification() {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('No notification permission');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Abhyas Habit Tracker 🔔',
      body: 'Notifications are working perfectly!',
      sound: true,
    },
    trigger: null, // trigger immediately
  });
}
