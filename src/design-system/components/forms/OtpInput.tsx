import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, type Theme } from '../../themes';
import { fontFamily } from '../../tokens';
import { FieldShell } from './FieldShell';

export interface OtpInputProps {
  value: string;
  onChangeText: (value: string) => void;
  /** 4 for delivery codes, 6 for SMS verification. */
  length?: 4 | 6;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.sm, alignSelf: 'stretch' },
    cell: {
      flex: 1,
      aspectRatio: 0.8,
      maxWidth: 60,
      borderRadius: theme.radiusUsage.input,
      borderWidth: theme.borderWidth.thick,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenInput: {
      ...StyleSheet.absoluteFill,
      opacity: 0,
      fontFamily,
    },
    digit: {
      fontFamily,
      textAlign: 'center',
    },
  });

/**
 * Code entry for SMS verification and delivery-code confirmation.
 *
 * One real input sits invisibly over the cells rather than one input per cell:
 * that keeps paste, autofill and backspace behaving natively, which per-cell
 * implementations reliably break.
 */
export function OtpInput({
  value,
  onChangeText,
  length = 4,
  label,
  helperText,
  errorText,
  disabled,
  autoFocus,
  onComplete,
}: OtpInputProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const inputRef = useRef<TextInput>(null);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');
  const focusedIndex = Math.min(value.length, length - 1);

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, length);
    onChangeText(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
    >
      <View style={styles.row}>
        {digits.map((digit, i) => {
          const isFilled = digit.trim() !== '';
          const isFocused = !disabled && i === focusedIndex && value.length < length;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                {
                  backgroundColor: theme.colors.background.elevated,
                  borderColor: errorText
                    ? theme.colors.border.error
                    : isFocused
                      ? theme.colors.border.focused
                      : isFilled
                        ? theme.colors.border.strong
                        : theme.colors.border.default,
                },
              ]}
            >
              <Text
                style={[
                  styles.digit,
                  {
                    color: theme.colors.text.primary,
                    fontSize: 24 * theme.fontScale,
                    lineHeight: 30 * theme.fontScale,
                    fontWeight: '700',
                  },
                ]}
              >
                {digit.trim()}
              </Text>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          editable={!disabled}
          autoFocus={autoFocus}
          textContentType="oneTimeCode"
          accessibilityLabel={label ?? 'Doğrulama kodu'}
          style={styles.hiddenInput}
          caretHidden
        />
      </View>
    </FieldShell>
  );
}
