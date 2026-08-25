import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useAccent, useOnAccent } from '../contexts/ThemeContext';

export default function NotFoundScreen() {
  const router = useRouter();
  const accent = useAccent();
  const onAccent = useOnAccent();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Page not found</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: accent }]} onPress={() => router.replace('/')}>
        <Text style={[styles.buttonText, { color: onAccent }]}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl * 2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
});
