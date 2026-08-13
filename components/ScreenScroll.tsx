import React from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const ScreenScroll = ({
  children,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: ScrollViewProps) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      bottomOffset={120}
      extraKeyboardSpace={40}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};
