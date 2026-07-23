import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { hitSlopFor } from '../../tokens';

export type IconButtonVariant = 'plain' | 'surface' | 'filled' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  icon: LucideIcon;
  /** Required — an icon alone is not a label for a screen reader. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  /** Small unread/count dot in the top-right corner. */
  badge?: number | boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZE_MAP = {
  sm: { box: 32, icon: 'sm' },
  md: { box: 40, icon: 'md' },
  lg: { box: 48, icon: 'lg' },
} as const;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    box: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.full,
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.feedback.error,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth.thick,
      borderColor: theme.colors.background.elevated,
    },
    badgeDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.feedback.error,
      borderWidth: theme.borderWidth.thick,
      borderColor: theme.colors.background.elevated,
    },
    badgeLabel: {
      color: theme.colors.text.onSolid,
      fontSize: 9,
      fontWeight: '700',
      lineHeight: 11,
    },
  });

/**
 * Icon-only control.
 *
 * `accessibilityLabel` is a required prop, not an optional nicety — an icon
 * button without one is unusable with a screen reader, and making it required
 * means the compiler catches that instead of an audit.
 *
 * Boxes smaller than 44pt get a `hitSlop` so the touch target still meets the
 * accessibility floor even when the visual is compact.
 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  size = 'md',
  disabled = false,
  badge,
  style,
  testID,
}: IconButtonProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const sizing = SIZE_MAP[size];

  const colors = {
    plain: { bg: 'transparent', fg: theme.colors.text.secondary, border: undefined },
    surface: {
      bg: theme.colors.background.secondary,
      fg: theme.colors.text.primary,
      border: theme.colors.border.subtle,
    },
    filled: { bg: theme.colors.action.primary, fg: theme.colors.text.inverse, border: undefined },
    danger: {
      bg: theme.colors.feedback.errorSurface,
      fg: theme.colors.feedback.error,
      border: undefined,
    },
  }[variant];

  return (
    <Touchable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      feedback="control"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlopFor(sizing.box)}
      testID={testID}
      style={[{ opacity: disabled ? theme.opacity.disabled : 1 }, style]}
    >
      <View
        style={[
          styles.box,
          {
            width: sizing.box,
            height: sizing.box,
            backgroundColor: colors.bg,
          },
          colors.border && {
            borderWidth: theme.borderWidth.hairline,
            borderColor: colors.border,
          },
        ]}
      >
        <Icon icon={icon} size={sizing.icon} color={colors.fg} />
        {typeof badge === 'number' && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
        {badge === true && <View style={styles.badgeDot} />}
      </View>
    </Touchable>
  );
}
