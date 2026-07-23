/**
 * Icon sizes, control heights and touch targets.
 *
 * `touchTarget.min` is 44 — the accessibility floor. Any control shorter than
 * that (a small chip, a close button) must still expose a 44pt hit area via
 * `hitSlop`; `hitSlopFor()` computes the padding needed.
 */

export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  /** Empty-state and permission illustrations. */
  hero: 56,
} as const;

export type IconSizeToken = keyof typeof iconSize;

export const controlHeight = {
  /** Chips, small badges with actions. */
  xs: 28,
  /** Compact inline buttons. */
  sm: 36,
  /** Default control height — inputs, buttons, selects. */
  md: 48,
  /** Prominent CTAs, sheet confirm buttons. */
  lg: 56,
} as const;

export type ControlHeightToken = keyof typeof controlHeight;

export const touchTarget = {
  min: 44,
} as const;

/** Fixed chrome heights, so screens can reserve space without measuring. */
export const chrome = {
  header: 56,
  tabBar: 64,
  /** iOS home indicator clearance. */
  homeIndicator: 34,
  /** Notch / dynamic island clearance used by the Storybook device frame. */
  statusBar: 54,
} as const;

export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
} as const;

export type AvatarSizeToken = keyof typeof avatarSize;

/**
 * Padding needed on each side to lift a control up to the 44pt minimum.
 * Returns `undefined` when the control is already large enough, so it can be
 * spread onto `hitSlop` without a branch at the call site.
 */
export function hitSlopFor(size: number) {
  const missing = touchTarget.min - size;
  if (missing <= 0) return undefined;
  const pad = Math.ceil(missing / 2);
  return { top: pad, bottom: pad, left: pad, right: pad };
}
