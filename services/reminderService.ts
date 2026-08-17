import { Platform } from 'react-native';

export const syncPeriodReminder = async (enabled: boolean): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) {
      return;
    }

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New budgeting period',
        body: 'Start a new month in Budgetr when you are ready.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1,
        hour: 9,
        minute: 0,
      },
    });
  } catch {
    // Notifications are optional and may be unavailable in Expo Go.
  }
};
