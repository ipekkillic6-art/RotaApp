import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../themes';
import type { SpacingToken } from '../tokens';

/** Fixed gap. Prefer a parent `gap` where possible; this is for one-offs. */
export function Spacer({
  size = 'lg',
  horizontal = false,
}: {
  size?: SpacingToken | number;
  horizontal?: boolean;
}) {
  const theme = useTheme();
  const px = typeof size === 'number' ? size : theme.spacing[size];
  return <View style={horizontal ? { width: px } : { height: px }} />;
}

/** Absorbs remaining space in a flex row/column. */
export function Flex() {
  return <View style={{ flex: 1 }} />;
}

export interface DividerProps {
  /** `inset` indents the line to align with text after a leading icon/avatar. */
  inset?: number;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Divider({ inset = 0, vertical = false, style }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="none"
      style={[
        vertical
          ? { width: theme.borderWidth.hairline, alignSelf: 'stretch' }
          : {
              height: theme.borderWidth.hairline,
              alignSelf: 'stretch',
              marginLeft: inset,
            },
        { backgroundColor: theme.colors.border.subtle },
        style,
      ]}
    />
  );
}
