import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { hitSlopFor } from '../../tokens';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      minHeight: theme.touchTarget.min,
    },
    box: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.xs,
      borderWidth: theme.borderWidth.thick,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.full,
      borderWidth: theme.borderWidth.thick,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: { width: 10, height: 10, borderRadius: theme.radius.full },
    labels: { flex: 1, gap: 2 },
    track: {
      width: 48,
      height: 28,
      borderRadius: theme.radius.full,
      padding: 3,
      justifyContent: 'center',
    },
    thumb: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.full,
      // Stays light in both themes — it rides on the brand-coloured track.
      backgroundColor: theme.colors.text.onSolid,
    },
  });

interface ToggleBaseProps {
  label?: string;
  /** Secondary line under the label. */
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Used when there is no visible label. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type CheckboxProps = ToggleBaseProps;

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled,
  accessibilityLabel,
  style,
}: CheckboxProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Touchable
      onPress={disabled ? undefined : () => onChange(!checked)}
      disabled={disabled}
      feedback="opacity"
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={hitSlopFor(22)}
      style={[disabled && { opacity: theme.opacity.disabled }, style]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.box,
            {
              backgroundColor: checked ? theme.colors.action.primary : 'transparent',
              borderColor: checked
                ? theme.colors.action.primary
                : theme.colors.border.strong,
            },
          ]}
        >
          {checked && <Icon icon={Check} size={14} color={theme.colors.text.inverse} strokeWidth={3} />}
        </View>
        {(label || description) && (
          <View style={styles.labels}>
            {label && <Typography variant="body">{label}</Typography>}
            {description && (
              <Typography variant="micro" tone="muted">
                {description}
              </Typography>
            )}
          </View>
        )}
      </View>
    </Touchable>
  );
}

export type RadioProps = ToggleBaseProps;

export function Radio({
  label,
  description,
  checked,
  onChange,
  disabled,
  accessibilityLabel,
  style,
}: RadioProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Touchable
      onPress={disabled ? undefined : () => onChange(true)}
      disabled={disabled}
      feedback="opacity"
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={hitSlopFor(22)}
      style={[disabled && { opacity: theme.opacity.disabled }, style]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.circle,
            {
              borderColor: checked
                ? theme.colors.action.primary
                : theme.colors.border.strong,
            },
          ]}
        >
          {checked && (
            <View style={[styles.dot, { backgroundColor: theme.colors.action.primary }]} />
          )}
        </View>
        {(label || description) && (
          <View style={styles.labels}>
            {label && <Typography variant="body">{label}</Typography>}
            {description && (
              <Typography variant="micro" tone="muted">
                {description}
              </Typography>
            )}
          </View>
        )}
      </View>
    </Touchable>
  );
}

export interface SwitchProps extends ToggleBaseProps {
  /** Puts the switch on the right of a full-width row — the settings pattern. */
  inline?: boolean;
}

/**
 * Switch.
 *
 * Built from Animated rather than RN's `Switch` so the courier online/offline
 * toggle — the single most consequential control in the app — uses the
 * product's own colours in both themes instead of the platform's.
 */
export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
  accessibilityLabel,
  inline = true,
  style,
}: SwitchProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    if (theme.reducedMotion) {
      progress.setValue(checked ? 1 : 0);
      return;
    }
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: theme.duration.fast,
      easing: theme.easing.standard,
      useNativeDriver: false,
    }).start();
  }, [checked, progress, theme]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border.strong, theme.colors.action.primary],
  });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  const control = (
    <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
    </Animated.View>
  );

  return (
    <Touchable
      onPress={disabled ? undefined : () => onChange(!checked)}
      disabled={disabled}
      feedback="opacity"
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[disabled && { opacity: theme.opacity.disabled }, style]}
    >
      <View style={styles.row}>
        {inline && (label || description) && (
          <View style={styles.labels}>
            {label && <Typography variant="body">{label}</Typography>}
            {description && (
              <Typography variant="micro" tone="muted">
                {description}
              </Typography>
            )}
          </View>
        )}
        {control}
      </View>
    </Touchable>
  );
}
