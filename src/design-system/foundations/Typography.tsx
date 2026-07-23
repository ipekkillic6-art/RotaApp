import React, { useMemo } from 'react';
import { Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../themes';
import {
  interFontFamily,
  fontWeight,
  overline as overlineStyle,
  tabular as tabularStyle,
  type TypographyVariant,
} from '../tokens';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'accent'
  | 'danger'
  | 'success';

export interface TypographyProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;
  /** Role in the type scale. Defaults to `body`. */
  variant?: TypographyVariant;
  /** Semantic text colour. */
  tone?: TextTone;
  /** Escape hatch for status/role colours that aren't in the text scale. */
  color?: string;
  align?: TextStyle['textAlign'];
  /** Uppercase eyebrow treatment. */
  overline?: boolean;
  /** Tabular figures — use for any number that updates in place. */
  tabular?: boolean;
  /** Override the variant's weight without leaving the scale. */
  weight?: keyof typeof fontWeight;
  style?: StyleProp<TextStyle>;
}

/**
 * The only way text is rendered in this system.
 *
 * Font scaling is applied here from `theme.fontScale` rather than left to the
 * platform, so the Storybook large-text stories reflow exactly like a device
 * with Dynamic Type turned up.
 */
export function Typography({
  children,
  variant = 'body',
  tone = 'primary',
  color,
  align,
  overline = false,
  tabular = false,
  weight,
  style,
  ...rest
}: TypographyProps) {
  const theme = useTheme();

  const resolved = useMemo<TextStyle>(() => {
    const base = overline ? overlineStyle : theme.typography[variant];
    const scale = theme.fontScale;
    // Ağırlığı, adlandırılmış Inter ailesi üzerinden uygula (RN'de özel font
    // fontWeight'e — özellikle iOS'ta — güvenmez). fontWeight'i stilden düşür.
    const numericWeight = (weight ? fontWeight[weight] : base.fontWeight) ?? '400';
    const { fontWeight: _omitWeight, ...baseNoWeight } = base;
    return {
      ...baseNoWeight,
      fontFamily:
        interFontFamily[numericWeight as keyof typeof interFontFamily] ??
        interFontFamily['400'],
      fontSize: (base.fontSize ?? 15) * scale,
      lineHeight: (base.lineHeight ?? 22) * scale,
      color: color ?? theme.colors.text[tone],
      ...(align ? { textAlign: align } : null),
      ...(tabular ? tabularStyle : null),
    };
  }, [theme, variant, tone, color, align, overline, tabular, weight]);

  return (
    <RNText style={[resolved, style]} {...rest}>
      {children}
    </RNText>
  );
}
