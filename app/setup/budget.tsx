import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAccent, useOnAccent } from '../../contexts/ThemeContext';
import { ScreenScroll } from '../../components/ScreenScroll';

export default function BudgetScreen() {
  const router = useRouter();
  const accent = useAccent();
  const onAccent = useOnAccent();
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleContinue = () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    router.push({
      pathname: '/setup/categories',
      params: { budgetAmount: amount.toString() },
    });
  };

  return (
    <ScreenScroll style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>What's this month's budget?</Text>
        <Text style={styles.subtitle}>Enter the total amount you want to budget</Text>

        <View style={[styles.inputContainer, { borderColor: accent }]}>
          <Text style={[styles.dollarSign, { color: accent }]}>$</Text>
          <TextInput
            style={styles.input}
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: accent }, !budgetAmount && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!budgetAmount}
        >
          <Text style={[styles.buttonText, { color: onAccent }]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dollarSign: {
    fontSize: FontSizes.xxl,
    color: Colors.primaryGreen,
    fontWeight: 'bold',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
});
