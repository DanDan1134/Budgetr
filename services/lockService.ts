import { Platform } from 'react-native';
import { isLockEnabled } from './settingsService';

export const shouldLockApp = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  return isLockEnabled();
};

export const authenticateUnlock = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  try {
    const LocalAuthentication = await import('expo-local-authentication');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Budgetr',
      cancelLabel: 'Cancel',
    });
    return result.success;
  } catch {
    return true;
  }
};
