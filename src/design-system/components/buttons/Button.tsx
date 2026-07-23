import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

/**
 * Button.
 *
 * Deliberately ONE component with a `variant` enum rather than five exported
 * button components: the visual difference between primary and danger is a
 * colour pair, not a different anatomy, and splitting them guarantees they
 * drift. `PrimaryButton` etc. are not re-exported — call sites read
 * `<Button variant="danger" …>`, which is greppable and typo-proof.
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. */
  icon?: LucideIcon;
  /** Trailing icon — for "next step" affordances. */
  iconEnd?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container. Defaults to true — mobile CTAs usually should. */
  fullWidth?: boolean;
  /** Overrides the label for screen readers when the label alone is ambiguous. */
  accessibilityLabel?: string;
  /** Announced by screen readers as extra context ("Bu işlem geri alınamaz"). */
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

interface VariantColors {
  background: string;
  label: string;
  border?: string;
  elevation?: 'none' | 'brand';
}

function variantColors(theme: Theme, variant: ButtonVariant): VariantColors {
  const c = theme.colors;
  switch (variant) {
    case 'primary':
      return { background: c.action.primary, label: c.text.inverse, elevation: 'brand' };
    case 'secondary':
      return { background: c.action.secondary, label: c.text.accent };
    case 'tertiary':
      return {
        background: 'transparent',
        label: c.text.primary,
        border: c.border.strong,
      };
    case 'ghost':
      return { background: 'transparent', label: c.text.accent };
    case 'danger':
      return { background: c.action.danger, label: c.text.inverse };
  }
}

const SIZE_MAP = {
  sm: { height: 'sm', text: 'caption', icon: 'sm', padX: 'md', gap: 'xs' },
  md: { height: 'md', text: 'bodyStrong', icon: 'md', padX: 'xl', gap: 'sm' },
  lg: { height: 'lg', text: 'h3', icon: 'md', padX: '2xl', gap: 'sm' },
} as const;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radiusUsage.button,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    /** Keeps the button's width stable while the spinner is up. */
    spinnerOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hidden: { opacity: 0 },
  });

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const sizing = SIZE_MAP[size];

  const inert = disabled || loading;
  const v = variantColors(theme, variant);

  // Disabled reduces contrast rather than recolouring, so the button keeps its
  // identity and the state reads as "not now" instead of "different button".
  const background = disabled ? theme.colors.action.disabled : v.background;
  const labelColor = disabled ? theme.colors.action.disabledText : v.label;
  const borderColor = disabled ? theme.colors.border.subtle : v.border;

  return (
    <Touchable
      onPress={inert ? undefined : onPress}
      disabled={inert}
      feedback={variant === 'ghost' || variant === 'tertiary' ? 'opacity' : 'control'}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inert, busy: loading }}
      testID={testID}
      style={[fullWidth ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }, style]}
    >
      <View
        style={[
          styles.base,
          {
            backgroundColor: background,
            minHeight: theme.controlHeight[sizing.height],
            paddingHorizontal: theme.spacing[sizing.padX],
          },
          borderColor && {
            borderWidth: theme.borderWidth.hairline,
            borderColor,
          },
          v.elevation === 'brand' && !disabled ? theme.shadows.brand : null,
        ]}
      >
        <View
          style={[
            styles.content,
            { gap: theme.spacing[sizing.gap] },
            loading && styles.hidden,
          ]}
        >
          {icon && <Icon icon={icon} size={sizing.icon} color={labelColor} />}
          <Typography variant={sizing.text} color={labelColor} numberOfLines={1}>
            {label}
          </Typography>
          {iconEnd && <Icon icon={iconEnd} size={sizing.icon} color={labelColor} />}
        </View>

        {loading && (
          <View style={styles.spinnerOverlay}>
            <ActivityIndicator size="small" color={labelColor} />
          </View>
        )}
      </View>
    </Touchable>
  );
}
