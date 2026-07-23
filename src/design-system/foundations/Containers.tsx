import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../themes';

/**
 * Safe-area insets.
 *
 * The real app should swap this for `useSafeAreaInsets()` from
 * react-native-safe-area-context — that dependency is intentionally not added
 * here because Storybook has no device to read insets from. The Storybook
 * device frame supplies the same numbers, so layouts are honest either way.
 */
export const DEFAULT_INSETS = { top: 54, bottom: 34 } as const;

export interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: Array<'top' | 'bottom'>;
  insets?: { top?: number; bottom?: number };
  style?: StyleProp<ViewStyle>;
}

export function SafeAreaContainer({
  children,
  edges = ['top', 'bottom'],
  insets,
  style,
}: SafeAreaContainerProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: edges.includes('top') ? insets?.top ?? DEFAULT_INSETS.top : 0,
          paddingBottom: edges.includes('bottom')
            ? insets?.bottom ?? DEFAULT_INSETS.bottom
            : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Canvas tone. `sunken` suits list-heavy screens where cards need to lift. */
  tone?: 'canvas' | 'sunken';
  /** Applies the standard horizontal gutter. Off for edge-to-edge screens. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Root of every screen: fills the device, owns the canvas colour, and caps
 * content width on tablets so a phone layout never stretches to 744px.
 */
export function ScreenContainer({
  children,
  tone = 'canvas',
  padded = false,
  style,
}: ScreenContainerProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width > theme.layout.maxContentWidth;

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor:
            tone === 'sunken'
              ? theme.colors.background.secondary
              : theme.colors.background.primary,
          alignItems: isWide ? 'center' : undefined,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: theme.layout.maxContentWidth,
          paddingHorizontal: padded ? theme.layout.screenPaddingX : 0,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export interface ScrollContainerProps extends Omit<ScrollViewProps, 'style'> {
  children: React.ReactNode;
  /** Applies the standard horizontal gutter to the scroll content. */
  padded?: boolean;
  /** Extra bottom padding so content clears a tab bar or docked action bar. */
  bottomInset?: number;
  /** Lifts content above the keyboard on form screens. */
  keyboardAware?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ScrollContainer({
  children,
  padded = true,
  bottomInset = 0,
  keyboardAware = false,
  contentContainerStyle,
  style,
  ...rest
}: ScrollContainerProps) {
  const theme = useTheme();

  const scroller = (
    <ScrollView
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: padded ? theme.layout.screenPaddingX : 0,
          paddingBottom: theme.spacing['2xl'] + bottomInset,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );

  if (!keyboardAware) return scroller;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroller}
    </KeyboardAvoidingView>
  );
}

/**
 * Two-column grid above the wide breakpoint, single column below.
 * Used by the admin dashboard and the earnings stat rows.
 */
export function ResponsiveGrid({
  children,
  gap,
  minColumnWidth = 150,
}: {
  children: React.ReactNode;
  gap?: number;
  minColumnWidth?: number;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const g = gap ?? theme.spacing.md;
  const items = React.Children.toArray(children);
  const available = Math.min(width, theme.layout.maxContentWidth) - theme.layout.screenPaddingX * 2;
  const columns = Math.max(1, Math.min(items.length, Math.floor(available / minColumnWidth)));

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: g }}>
      {items.map((child, i) => (
        <View
          key={i}
          style={{
            flexGrow: 1,
            flexBasis: columns > 1 ? `${100 / columns}%` : '100%',
            minWidth: columns > 1 ? minColumnWidth : undefined,
            maxWidth: columns > 1 ? `${100 / columns}%` : undefined,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
