/** 4px base grid. Every gap and pad in the system is a multiple of 4. */
export const spacing = {
  none: 0,
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Recurring layout constants, so screens stop re-deciding them. */
export const layout = {
  /** Horizontal gutter for every screen. */
  screenPaddingX: spacing.lg,
  /** Internal padding of a standard card. */
  cardPadding: spacing.lg,
  /** Vertical gap between cards in a list. */
  listGap: spacing.md,
  /** Gap between major sections on a screen. */
  sectionGap: spacing['2xl'],
  /** Content never grows wider than this — tablets get a centred column. */
  maxContentWidth: 520,
  /** Two-column dashboard grid kicks in above this width. */
  wideBreakpoint: 600,
} as const;
