import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ColorPicker, {
  Panel3,
  Preview,
  RedSlider,
  GreenSlider,
  BlueSlider,
  InputWidget,
} from 'reanimated-color-picker';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useAccent, useSetAccent } from '../contexts/ThemeContext';
import { DEFAULT_ACCENT } from '../utils/color';

const toHex = (value: string) => value.slice(0, 7).toUpperCase();

export default function ThemeScreen() {
  const accent = useAccent();
  const setAccent = useSetAccent();
  const [pickerKey, setPickerKey] = useState(0);
  const { width } = useWindowDimensions();
  const wheelSize = Math.min(200, width - Spacing.md * 2);

  const resetColor = () => {
    setAccent(DEFAULT_ACCENT, true);
    setPickerKey((key) => key + 1);
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ColorPicker
          key={pickerKey}
          value={accent}
          onChangeJS={(colors) => setAccent(toHex(colors.hex), Platform.OS === 'web')}
          onCompleteJS={(colors) => setAccent(toHex(colors.hex), true)}
          style={styles.picker}
          thumbSize={22}
          sliderThickness={14}
          boundedThumb
        >
          <View style={styles.topRow}>
            <Preview style={styles.preview} hideInitialColor hideText />
            <Text style={styles.hex}>{accent}</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetColor}
              accessibilityRole="button"
              accessibilityLabel="Reset to default color"
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.wheelWrap, { width: wheelSize, height: wheelSize }]}>
            <Panel3
              style={[styles.wheel, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2 }]}
              centerChannel="saturation"
            />
          </View>
          <View style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>R</Text>
            <RedSlider style={styles.slider} />
          </View>
          <View style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>G</Text>
            <GreenSlider style={styles.slider} />
          </View>
          <View style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>B</Text>
            <BlueSlider style={styles.slider} />
          </View>
          <InputWidget
            defaultFormat="RGB"
            formats={['RGB', 'HEX']}
            disableAlphaChannel
            containerStyle={styles.inputs}
            inputStyle={styles.input}
            inputTitleStyle={styles.inputTitle}
            iconColor={Colors.textSecondary}
          />
        </ColorPicker>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  picker: {
    width: '100%',
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  preview: {
    width: 40,
    height: 32,
    borderRadius: BorderRadius.md,
  },
  hex: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  resetText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  wheelWrap: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  wheel: {
    overflow: 'hidden',
  },
  sliderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sliderLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    width: 14,
  },
  slider: {
    flex: 1,
    height: 14,
    borderRadius: 7,
  },
  inputs: {
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    color: Colors.textPrimary,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  inputTitle: {
    color: Colors.textSecondary,
  },
});
