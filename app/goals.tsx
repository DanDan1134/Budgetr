import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import { createGoal, deleteGoal, getGoals, Goal } from '../services/goalService';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const load = async () => setGoals(await getGoals());

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => console.error(error));
    }, [])
  );

  const addGoal = async () => {
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Error', 'Enter a name and target amount');
      return;
    }
    await createGoal(name.trim(), parsed);
    setName('');
    setAmount('');
    await load();
  };

  return (
    <ScreenScroll style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Save goals</Text>
      <Text style={styles.subtitle}>Progress uses leftover budget this period.</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Goal name"
        placeholderTextColor={Colors.textSecondary}
      />
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Target amount"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="decimal-pad"
      />
      <TouchableOpacity style={styles.button} onPress={addGoal}>
        <Text style={styles.buttonText}>Add goal</Text>
      </TouchableOpacity>
      {goals.map((goal) => (
        <View key={goal.id} style={styles.card}>
          <View>
            <Text style={styles.itemTitle}>{goal.name}</Text>
            <Text style={styles.itemMeta}>${goal.target_amount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteGoal(goal.id).then(load)}>
            <Text style={styles.delete}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: 'bold' },
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: Spacing.xs },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  buttonText: { color: Colors.textPrimary, fontWeight: 'bold' },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: { color: Colors.textPrimary, fontWeight: '600' },
  itemMeta: { color: Colors.textSecondary, marginTop: Spacing.xs },
  delete: { color: Colors.error },
});
