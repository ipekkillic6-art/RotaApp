import type { TextStyle } from 'react-native';

/**
 * Type scale.
 *
 * Nine roles, no more. A screen that needs a tenth is a screen with a
 * hierarchy problem. Line heights are absolute (px) rather than unitless
 * because React Native's `lineHeight` takes points.
 *
 * `tabular` is exported separately and applied to any number that changes in
 * place — prices, ETAs, delivery codes, counters — so digits stop jittering.
 */

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const satisfies Record<string, TextStyle['fontWeight']>;

/**
 * Yüklü Inter font aileleri (numeric ağırlık → font adı).
 *
 * RN'de özel font `fontWeight`'e güvenmez — her ağırlık ayrı bir font adıdır.
 * Adlar iki platformda da aynıdır (@expo-google-fonts/inter). Typography bu
 * haritayı kullanarak variant'ın ağırlığına göre doğru Inter ailesini seçer.
 */
export const interFontFamily = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
} as const;

/** Varsayılan (gövde) font ailesi — TextInput gibi tek ağırlıklı yerler için. */
export const fontFamily: string = interFontFamily['400'];

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'bodySm'
  | 'caption'
  | 'micro'
  | 'tiny';

export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: fontWeight.extrabold, letterSpacing: -0.6 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: fontWeight.bold, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: fontWeight.bold, letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: fontWeight.semibold, letterSpacing: -0.1 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: fontWeight.regular },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: fontWeight.semibold },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.medium },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: fontWeight.semibold, letterSpacing: 0.2 },
  tiny: { fontSize: 10, lineHeight: 13, fontWeight: fontWeight.medium, letterSpacing: 0.3 },
};

/** Uppercase eyebrow/label treatment — pairs with `micro`. */
export const overline: TextStyle = {
  fontSize: 11,
  lineHeight: 15,
  fontWeight: fontWeight.bold,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
};

/** Tabular figures — apply to any in-place changing number. */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };
