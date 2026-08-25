import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ACCENT, isHexColor, onAccentText } from '../utils/color';

const STORAGE_KEY = 'budgetr-accent-color';

type ThemeContextValue = {
  accent: string;
  setAccent: (color: string, persist?: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => undefined,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value && isHexColor(value)) {
          setAccentState(value.toUpperCase());
        }
      })
      .catch(() => undefined);
  }, []);

  const setAccent = useCallback((color: string, persist = true) => {
    const next = color.toUpperCase();
    setAccentState(next);
    if (persist) {
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAccent = () => useContext(ThemeContext).accent;

export const useOnAccent = () => onAccentText(useContext(ThemeContext).accent);

export const useSetAccent = () => useContext(ThemeContext).setAccent;
