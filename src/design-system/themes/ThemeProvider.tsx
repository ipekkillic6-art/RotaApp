import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import type { ThemeMode } from '../tokens';
import { buildTheme, type Theme } from './theme';

export type ThemePreference = ThemeMode | 'system';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** `'system'` follows the OS setting. Storybook pins this from the toolbar. */
  preference?: ThemePreference;
  /** Force reduced motion regardless of the OS setting (used by stories). */
  reducedMotion?: boolean;
  /** Dynamic-type multiplier; 1 = system default. */
  fontScale?: number;
}

export function ThemeProvider({
  children,
  preference: preferenceProp = 'system',
  reducedMotion: reducedMotionProp,
  fontScale = 1,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(preferenceProp);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  // Controlled usage: a changing prop wins over local state.
  useEffect(() => setPreference(preferenceProp), [preferenceProp]);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((enabled) => {
      if (active) setSystemReducedMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setSystemReducedMotion,
    );
    return () => {
      active = false;
      sub?.remove?.();
    };
  }, []);

  const mode: ThemeMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const reducedMotion = reducedMotionProp ?? systemReducedMotion;

  const toggle = useCallback(
    () => setPreference((p) => (p === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(mode, reducedMotion, fontScale),
      mode,
      preference,
      setPreference,
      toggle,
    }),
    [mode, reducedMotion, fontScale, preference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Full theme context — use when you need to change the theme, not just read it. */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used inside a <ThemeProvider>.');
  }
  return ctx;
}

/** The resolved theme. This is the hook components actually use. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}
