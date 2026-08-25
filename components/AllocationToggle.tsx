import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSizes, BorderRadius } from '../constants/theme';
import { useAccent, useOnAccent } from '../contexts/ThemeContext';

export type AllocationType = 'percentage' | 'dollar';

interface AllocationToggleProps {
  value: AllocationType;
  onChange: (value: AllocationType) => void;
}

export const AllocationToggle = ({ value, onChange }: AllocationToggleProps) => {
  const accent = useAccent();
  const onAccent = useOnAccent();
  return (
    <View style={styles.track}>
      <TouchableOpacity
        style={[styles.option, value === 'percentage' && [styles.optionActive, { backgroundColor: accent }]]}
        onPress={() => onChange('percentage')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'percentage' }}
        accessibilityLabel="Percent"
      >
        <Text style={[styles.label, value === 'percentage' && [styles.labelActive, { color: onAccent }]]}>%</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, value === 'dollar' && [styles.optionActive, { backgroundColor: accent }]]}
        onPress={() => onChange('dollar')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'dollar' }}
        accessibilityLabel="Dollars"
      >
        <Text style={[styles.label, value === 'dollar' && [styles.labelActive, { color: onAccent }]]}>$</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 50,
    width: 100,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: Colors.primaryGreen,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.textPrimary,
  },
});
