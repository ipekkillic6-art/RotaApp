/**
 * Primitive palette — the ONLY place raw hex values are allowed.
 *
 * Nothing outside `tokens/colors.ts` may import from here. Components and
 * screens speak semantic tokens (`theme.colors.text.primary`,
 * `theme.colors.status.onTheWay`), never `palette.blue[600]`.
 *
 * Ramps are tuned for a delivery/ops product:
 * - `blue`   brand ("Rota") — trust + motion, deliberately NOT the delivery
 *            cliché of grass-green or hi-vis orange.
 * - `slate`  the workhorse neutral. Slightly cool so dense operational data
 *            reads calm rather than muddy.
 * - `green` / `red` / `amber` — terminal + attention states only.
 * - `violet` — courier role accent (chrome only, never a status).
 */

export const palette = {
  /* ── Brand: Rota Açık Mavi (sky) ──────────────────────────────────── */
  blue: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  /* ── Neutral: cool slate ──────────────────────────────────────────── */
  slate: {
    0: '#FFFFFF',
    25: '#FAFBFC',
    50: '#F3F6F8',
    100: '#E8EDF2',
    200: '#D5DDE5',
    300: '#B4C0CC',
    400: '#8996A5',
    500: '#647383',
    600: '#4A5967',
    700: '#374351',
    800: '#222C38',
    850: '#19212B',
    900: '#111821',
    950: '#0A0F15',
  },

  /* ── Success ──────────────────────────────────────────────────────── */
  green: {
    100: '#D6F5E1',
    300: '#6EE7A5',
    400: '#3ED07F',
    500: '#1FA35C',
    600: '#17864B',
    700: '#136A3C',
  },

  /* ── Attention / delay ────────────────────────────────────────────── */
  amber: {
    100: '#FDF0D5',
    300: '#F8CF7A',
    400: '#F2B23C',
    500: '#D9911A',
    600: '#B37414',
    700: '#8C5A10',
  },

  /* ── Danger ───────────────────────────────────────────────────────── */
  red: {
    100: '#FCE2E2',
    300: '#F5A3A3',
    400: '#EE7070',
    500: '#DC4141',
    600: '#BE2E2E',
    700: '#9B2424',
  },

  /* ── Courier role accent ──────────────────────────────────────────── */
  violet: {
    100: '#EAE4FD',
    300: '#BCA6F7',
    400: '#9B7BF0',
    500: '#7C56E3',
    600: '#6743C4',
    700: '#5435A1',
  },

  /* ── Fixed ────────────────────────────────────────────────────────── */
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type Palette = typeof palette;
