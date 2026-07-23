import type { ViewStyle } from 'react-native';
import type { ThemeMode } from './colors';

/**
 * Elevation.
 *
 * Shadows communicate layering, not decoration — an operational screen with
 * glowing cards is noise. Dark mode leans on surface lightness rather than
 * shadow, so the dark values are deliberately weaker.
 *
 * No coloured shadows anywhere except `brand`, which is reserved for a
 * screen's single primary CTA.
 */

export type ElevationToken = 'none' | 'sm' | 'md' | 'lg' | 'brand';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const NONE: ShadowStyle = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

const light: Record<ElevationToken, ShadowStyle> = {
  none: NONE,
  sm: {
    shadowColor: '#0A0F15',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0A0F15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A0F15',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
  brand: {
    shadowColor: '#0A7D74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
};

const dark: Record<ElevationToken, ShadowStyle> = {
  none: NONE,
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 12,
  },
  brand: {
    shadowColor: '#0E9A8F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
};

export const shadowsFor = (mode: ThemeMode): Record<ElevationToken, ShadowStyle> =>
  mode === 'dark' ? dark : light;
