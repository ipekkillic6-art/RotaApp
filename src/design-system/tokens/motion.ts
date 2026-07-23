import { Easing } from 'react-native';

/**
 * Motion.
 *
 * Rule of the system: animation is information. A courier glancing at the
 * screen mid-ride should learn something from movement (this status advanced,
 * this sheet came from the bottom) — never be entertained by it.
 *
 * Nothing exceeds 420ms. Nothing bounces except the single "accepted" and
 * "delivered" confirmations, where overshoot is the point.
 */

export const duration = {
  /** Press feedback — must feel instant. */
  instant: 90,
  fast: 160,
  normal: 240,
  slow: 320,
  /** Sheet/modal entrances, status transitions. */
  deliberate: 420,
} as const;

export type DurationToken = keyof typeof duration;

export const easing = {
  /** Entering the screen — fast out, settle in. */
  enter: Easing.bezier(0.22, 1, 0.36, 1),
  /** Leaving — accelerate away. */
  exit: Easing.bezier(0.4, 0, 1, 1),
  /** Everything else. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Success confirmations only. */
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
  linear: Easing.linear,
} as const;

export type EasingToken = keyof typeof easing;

/** Shared press-feedback geometry. */
export const press = {
  scale: 0.97,
  cardScale: 0.985,
  opacity: 0.88,
} as const;

/** Stagger step for list entrances. Beyond ~6 items, stop staggering. */
export const stagger = { step: 45, maxItems: 6 } as const;
