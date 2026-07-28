import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../themes';
import type { IconSizeToken } from '../tokens';
import type { TextTone } from './Typography';

export interface IconProps {
  icon: LucideIcon;
  /** A size token, or an explicit number when a layout demands it. */
  size?: IconSizeToken | number;
  /** Semantic colour, matched to the text scale so icon + label agree. */
  tone?: TextTone;
  /** Escape hatch for status/role colours. */
  color?: string;
  strokeWidth?: number;
}

/**
 * Single entry point for iconography.
 *
 * Every icon in the product is a Lucide outline icon at 1.75 stroke — emoji
 * and unicode glyphs are never used as icons, because they don't respect the
 * colour system and render differently per platform.
 *
 * Memoised: every glyph is an SVG tree, and the props are a stable component
 * reference plus primitives. Without this, typing one character in a form
 * re-renders every icon on the screen.
 */
export const Icon = React.memo(function Icon({
  icon: LucideGlyph,
  size = 'md',
  tone = 'primary',
  color,
  strokeWidth = 1.75,
}: IconProps) {
  const theme = useTheme();
  const px = typeof size === 'number' ? size : theme.iconSize[size];
  return (
    <LucideGlyph
      size={px}
      color={color ?? theme.colors.text[tone]}
      strokeWidth={strokeWidth}
    />
  );
});
