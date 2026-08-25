import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface PageNumbersProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export const PageNumbers: React.FC<PageNumbersProps> = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <View style={styles.row}>
      {pages.map((pageNumber) => {
        const active = pageNumber === page;
        return (
          <TouchableOpacity
            key={pageNumber}
            style={[styles.page, active && styles.pageActive]}
            onPress={() => onChange(pageNumber)}
            accessibilityRole="button"
            accessibilityLabel={`Page ${pageNumber}`}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.pageText, active && styles.pageTextActive]}>{pageNumber}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  page: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  pageText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  pageTextActive: {
    color: Colors.textPrimary,
  },
});
