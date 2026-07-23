import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../themes';
import type { ElevationToken, RadiusToken, SpacingToken } from '../tokens';

export type SurfaceTone = 'canvas' | 'sunken' | 'elevated' | 'overlay' | 'brand';

export interface SurfaceProps {
  children?: React.ReactNode;
  tone?: SurfaceTone;
  elevation?: ElevationToken;
  radius?: RadiusToken;
  padding?: SpacingToken | number;
  /** Draws a hairline border in the theme's default border colour. */
  bordered?: boolean;
  /** Overrides the border colour — used for selected/error states. */
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The panel primitive every card, sheet and tile is built from.
 *
 * Having one Surface is what keeps card backgrounds, borders and elevation
 * from drifting apart across forty screens.
 */
export function Surface({
  children,
  tone = 'elevated',
  elevation = 'none',
  radius = 'lg',
  padding = 'none',
  bordered = false,
  borderColor,
  style,
}: SurfaceProps) {
  const theme = useTheme();

  const backgroundColor = {
    canvas: theme.colors.background.primary,
    sunken: theme.colors.background.secondary,
    elevated: theme.colors.background.elevated,
    overlay: theme.colors.background.overlay,
    brand: theme.colors.background.brandSubtle,
  }[tone];

  const pad = typeof padding === 'number' ? padding : theme.spacing[padding];

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: theme.radius[radius],
          padding: pad,
        },
        (bordered || borderColor) && {
          borderWidth: theme.borderWidth.hairline,
          borderColor: borderColor ?? theme.colors.border.default,
        },
        theme.shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}
