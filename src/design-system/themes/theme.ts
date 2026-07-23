import {
  avatarSize,
  borderWidth,
  chrome,
  colorsFor,
  controlHeight,
  duration,
  easing,
  iconSize,
  layout,
  opacity,
  press,
  radius,
  radiusUsage,
  shadowsFor,
  spacing,
  stagger,
  touchTarget,
  typography,
  zIndex,
  type ThemeColors,
  type ThemeMode,
} from '../tokens';

/**
 * The resolved theme handed to every component.
 *
 * Mode-dependent groups (`colors`, `shadows`) are resolved; mode-independent
 * groups are passed through so a component needs exactly one hook to reach
 * the entire token system.
 */
export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  shadows: ReturnType<typeof shadowsFor>;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  radiusUsage: typeof radiusUsage;
  typography: typeof typography;
  borderWidth: typeof borderWidth;
  opacity: typeof opacity;
  iconSize: typeof iconSize;
  controlHeight: typeof controlHeight;
  touchTarget: typeof touchTarget;
  chrome: typeof chrome;
  avatarSize: typeof avatarSize;
  duration: typeof duration;
  easing: typeof easing;
  press: typeof press;
  stagger: typeof stagger;
  zIndex: typeof zIndex;
  /** True when the user asked for reduced motion — components skip non-essential animation. */
  reducedMotion: boolean;
  /**
   * Dynamic-type multiplier (1 = system default). `Typography` scales font and
   * line height by this, so large-text stories exercise real reflow rather
   * than a screenshot zoom.
   */
  fontScale: number;
}

const staticParts = {
  spacing,
  layout,
  radius,
  radiusUsage,
  typography,
  borderWidth,
  opacity,
  iconSize,
  controlHeight,
  touchTarget,
  chrome,
  avatarSize,
  duration,
  easing,
  press,
  stagger,
  zIndex,
};

export function buildTheme(
  mode: ThemeMode,
  reducedMotion = false,
  fontScale = 1,
): Theme {
  return {
    mode,
    colors: colorsFor(mode),
    shadows: shadowsFor(mode),
    reducedMotion,
    fontScale,
    ...staticParts,
  };
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
