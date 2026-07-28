import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';
import { Divider } from '../../foundations/Layout';
import { TextField, type TextFieldProps } from './TextField';

export interface PhoneFieldProps
  extends Omit<TextFieldProps, 'icon' | 'keyboardType' | 'multiline' | 'leading'> {
  /** Dial code shown in the fixed prefix. Only +90 is offered at this stage. */
  dialCode?: string;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    prefix: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.xs,
    },
  });

/** `5321142207` → `532 114 22 07` — grouped the way Turkish numbers are read. */
export function formatTrPhone(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  return parts.filter(Boolean).join(' ');
}

/**
 * Prefix block. Exported separately so a screen can put the dial code beside
 * a custom control without rebuilding it.
 */
export function DialCodePrefix({ dialCode = '+90' }: { dialCode?: string }) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.prefix}>
      <Typography variant="body" tone="secondary" tabular>
        {dialCode}
      </Typography>
      <Divider vertical style={{ height: theme.spacing.xl }} />
    </View>
  );
}

/**
 * Phone entry with a fixed country prefix.
 *
 * Digits are grouped as the user types. That is worth the extra code here: a
 * mistyped recipient number is a failed delivery, and the grouping is what
 * makes a wrong digit visible before submit.
 */
export function PhoneField({
  value,
  onChangeText,
  dialCode = '+90',
  placeholder = '5xx xxx xx xx',
  ...rest
}: PhoneFieldProps) {
  return (
    <TextField
      value={value}
      onChangeText={(text) => onChangeText(formatTrPhone(text))}
      keyboardType="phone-pad"
      textContentType="telephoneNumber"
      placeholder={placeholder}
      maxLength={13}
      leading={<DialCodePrefix dialCode={dialCode} />}
      {...rest}
    />
  );
}
