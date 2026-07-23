import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { X } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { fontFamily } from '../../tokens';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { FieldShell, useFieldBorder } from './FieldShell';

export interface TextFieldProps
  extends Pick<
    TextInputProps,
    | 'placeholder'
    | 'keyboardType'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'autoFocus'
    | 'secureTextEntry'
    | 'maxLength'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'textContentType'
  > {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  required?: boolean;
  disabled?: boolean;
  /** Leading icon inside the control. */
  icon?: LucideIcon;
  /** Shows a clear button once there is a value. */
  clearable?: boolean;
  /** Turns the control into a multi-line text area. */
  multiline?: boolean;
  /** Rows of visible text when `multiline`. */
  rows?: number;
  /** Shows an "n/max" counter on the label row. Requires `maxLength`. */
  showCounter?: boolean;
  /** Trailing element — a unit label, a visibility toggle, an action. */
  trailing?: React.ReactNode;
  /** Leading element rendered inside the control, before the input (e.g. a dial code). */
  leading?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    control: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: theme.controlHeight.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radiusUsage.input,
      borderWidth: theme.borderWidth.hairline,
    },
    multilineControl: {
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.md,
    },
    input: {
      flex: 1,
      fontFamily,
      padding: 0,
      margin: 0,
    },
  });

/**
 * The base text control — also the text area (`multiline`) and, through the
 * thin wrappers in this folder, the search and phone fields.
 *
 * Focus is drawn with a 2pt border rather than a glow: it survives dark mode,
 * costs no blur, and stays visible for a low-vision user.
 */
export function TextField({
  value,
  onChangeText,
  label,
  helperText,
  errorText,
  successText,
  required,
  disabled,
  icon,
  clearable,
  multiline,
  rows = 4,
  showCounter,
  trailing,
  leading,
  onFocus,
  onBlur,
  maxLength,
  testID,
  style,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [focused, setFocused] = useState(false);

  const status = errorText ? 'error' : successText ? 'success' : 'default';
  const borderColor = useFieldBorder({ focused, status, disabled });
  const showClear = clearable && value.length > 0 && !disabled;

  return (
    <FieldShell
      label={label}
      required={required}
      helperText={helperText}
      errorText={errorText}
      successText={successText}
      disabled={disabled}
      labelAccessory={
        showCounter && maxLength ? `${value.length}/${maxLength}` : undefined
      }
      style={style}
    >
      <View
        style={[
          styles.control,
          multiline && styles.multilineControl,
          {
            backgroundColor: disabled
              ? theme.colors.background.secondary
              : theme.colors.background.elevated,
            borderColor,
            borderWidth: focused ? theme.borderWidth.focus : theme.borderWidth.hairline,
          },
        ]}
      >
        {icon && (
          <Icon icon={icon} size="md" tone={focused ? 'accent' : 'muted'} />
        )}

        {leading}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={multiline ? rows : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={theme.colors.text.muted}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled }}
          testID={testID}
          style={[
            styles.input,
            {
              color: disabled ? theme.colors.text.muted : theme.colors.text.primary,
              fontSize: 15 * theme.fontScale,
              lineHeight: 22 * theme.fontScale,
              minHeight: multiline ? rows * 22 * theme.fontScale : undefined,
            },
          ]}
          {...inputProps}
        />

        {showClear && (
          <Touchable
            onPress={() => onChangeText('')}
            accessibilityLabel="Alanı temizle"
            feedback="opacity"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon icon={X} size="sm" tone="muted" />
          </Touchable>
        )}

        {trailing}
      </View>
    </FieldShell>
  );
}
