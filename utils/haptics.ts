import { Platform } from 'react-native';

export const hapticTap = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Native module may be missing in Expo Go or web.
  }
};

export const hapticSuccess = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Native module may be missing in Expo Go or web.
  }
};

export const hapticWarning = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Native module may be missing in Expo Go or web.
  }
};
