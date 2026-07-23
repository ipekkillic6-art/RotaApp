/**
 * Border widths and opacity steps.
 *
 * `hairline` is 1 rather than StyleSheet.hairlineWidth so the web preview and
 * the device agree; a 0.5px border disappears entirely in Storybook.
 */
export const borderWidth = {
  none: 0,
  hairline: 1,
  thick: 2,
  /** Focus ring — thick enough to be visible without shifting layout. */
  focus: 2,
} as const;

export const opacity = {
  /** Disabled controls — reduce opacity, never recolour. */
  disabled: 0.4,
  /** Pressed feedback on transparent/ghost surfaces. */
  pressed: 0.7,
  /** Non-essential decorative layers. */
  decorative: 0.5,
  /** Skeleton placeholders at rest. */
  skeleton: 0.9,
  full: 1,
} as const;
