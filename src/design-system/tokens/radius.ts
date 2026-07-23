export const radius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;

/** Where each radius belongs, so the scale is applied consistently. */
export const radiusUsage = {
  badge: radius.sm,
  chip: radius.full,
  input: radius.md,
  button: radius.md,
  card: radius.lg,
  cardLarge: radius.xl,
  sheet: radius['2xl'],
  modal: radius.xl,
  avatar: radius.full,
} as const;
