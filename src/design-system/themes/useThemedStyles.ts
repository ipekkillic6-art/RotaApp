import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import type { Theme } from './theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Builds a StyleSheet from the current theme and memoises it per theme object.
 *
 * This is what keeps components free of inline style objects: every component
 * declares one `makeStyles(theme)` factory at module scope and calls this.
 *
 *   const makeStyles = (t: Theme) => StyleSheet.create({ … });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  // The factory is expected to be module-scope stable; `theme` is the real key.
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
