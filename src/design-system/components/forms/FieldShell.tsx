import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';

export type FieldStatus = 'default' | 'error' | 'success';

export interface FieldShellProps {
  children: React.ReactNode;
  label?: string;
  /** Adds the required marker and sets `accessibilityRequired` on the control. */
  required?: boolean;
  /** Guidance shown when there is no error. */
  helperText?: string;
  /** Presence of this switches the field to the error state. */
  errorText?: string;
  /** Confirmation shown when the field validated successfully. */
  successText?: string;
  disabled?: boolean;
  /** Right-aligned counter/hint on the label row (e.g. "24/120"). */
  labelAccessory?: string;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { gap: theme.spacing.xs, alignSelf: 'stretch' },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing['2xs'],
    },
    message: { flex: 1 },
  });

/**
 * Label, helper text, error and success messaging for every field type.
 *
 * Sharing this is what stops a Select's error message from looking different
 * to a TextField's. Errors are announced with an icon plus red text —
 * never colour alone — and carry `accessibilityLiveRegion` so a screen reader
 * reads the message the moment validation fails.
 */
export function FieldShell({
  children,
  label,
  required = false,
  helperText,
  errorText,
  successText,
  disabled = false,
  labelAccessory,
  style,
}: FieldShellProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const message = errorText ?? successText ?? helperText;
  const status: FieldStatus = errorText ? 'error' : successText ? 'success' : 'default';

  return (
    <View style={[styles.root, disabled && { opacity: theme.opacity.disabled }, style]}>
      {(label || labelAccessory) && (
        <View style={styles.labelRow}>
          {label && (
            <Typography variant="caption" tone="secondary">
              {label}
              {required && (
                <Typography variant="caption" tone="danger">
                  {' *'}
                </Typography>
              )}
            </Typography>
          )}
          {labelAccessory && (
            <Typography variant="micro" tone="muted" tabular>
              {labelAccessory}
            </Typography>
          )}
        </View>
      )}

      {children}

      {message && (
        <View
          style={styles.messageRow}
          accessibilityLiveRegion={status === 'error' ? 'polite' : 'none'}
        >
          {status === 'error' && <Icon icon={AlertCircle} size="xs" tone="danger" />}
          {status === 'success' && <Icon icon={CheckCircle2} size="xs" tone="success" />}
          <Typography
            variant="micro"
            tone={status === 'error' ? 'danger' : status === 'success' ? 'success' : 'muted'}
            style={styles.message}
          >
            {message}
          </Typography>
        </View>
      )}
    </View>
  );
}

/** Border colour shared by every field control, so focus/error look identical. */
export function useFieldBorder(options: {
  focused?: boolean;
  status?: FieldStatus;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { focused, status = 'default', disabled } = options;
  if (status === 'error') return theme.colors.border.error;
  if (disabled) return theme.colors.border.subtle;
  if (focused) return theme.colors.border.focused;
  if (status === 'success') return theme.colors.feedback.success;
  return theme.colors.border.default;
}

/** Stable id for label/control association on web. */
export function useFieldId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}
