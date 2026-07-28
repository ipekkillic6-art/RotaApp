import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import type { AlertTone } from './InlineAlert';

export interface ToastProps {
  message: string;
  tone?: AlertTone;
  icon?: LucideIcon;
  /** Docks at the top (default) or above the tab bar. */
  placement?: 'top' | 'bottom';
  /** A single action — "Geri al" on a destructive change. */
  action?: { label: string; onPress: () => void };
  visible?: boolean;
  onDismiss?: () => void;
  /** Auto-dismiss delay in ms. 0 keeps it up until dismissed. */
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

const TONE_ICON: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background.overlay,
      borderWidth: theme.borderWidth.hairline,
      borderColor: theme.colors.border.subtle,
      alignSelf: 'stretch',
      zIndex: theme.zIndex.toast,
    },
    message: { flex: 1 },
  });

/**
 * Transient confirmation.
 *
 * The entrance is a short slide plus fade — the two GPU-friendly properties —
 * and collapses to a plain fade when reduced motion is on. A toast that
 * carries an action never auto-dismisses on a timer shorter than the action is
 * readable, so `duration` is ignored while `action` is present unless the
 * caller sets it explicitly.
 */
export function Toast({
  message,
  tone = 'info',
  icon,
  placement = 'top',
  action,
  visible = true,
  onDismiss,
  duration = 3200,
  style,
}: ToastProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? theme.duration.normal : theme.duration.fast,
      easing: visible ? theme.easing.enter : theme.easing.exit,
      useNativeDriver: true,
    }).start();
  }, [visible, progress, theme]);

  useEffect(() => {
    if (!visible || !onDismiss || duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, onDismiss, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [placement === 'top' ? -16 : 16, 0],
  });

  const color = theme.colors.feedback[tone];

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.root,
        theme.shadows.lg,
        {
          opacity: progress,
          transform: theme.reducedMotion ? [] : [{ translateY }],
        },
        style,
      ]}
    >
      <Icon icon={icon ?? TONE_ICON[tone]} size="md" color={color} />
      <Typography variant="bodySm" style={styles.message} numberOfLines={2}>
        {message}
      </Typography>
      {action && (
        <Touchable
          onPress={action.onPress}
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Typography variant="caption" color={theme.colors.text.accent} weight="semibold">
            {action.label}
          </Typography>
        </Touchable>
      )}
    </Animated.View>
  );
}

/**
 * Snackbar — a bottom-docked toast with a neutral tone.
 *
 * Kept as a named wrapper because the placement and tone defaults are the
 * whole difference, and repeating them at call sites is how they drift.
 */
export function Snackbar(props: Omit<ToastProps, 'placement'>) {
  return <Toast placement="bottom" {...props} />;
}

/** Positions a toast over a screen. Storybook stories use it directly. */
export function ToastHost({
  children,
  placement = 'top',
}: {
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
}) {
  const theme = useTheme();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: theme.layout.screenPaddingX,
        right: theme.layout.screenPaddingX,
        [placement]: theme.spacing.lg,
        zIndex: theme.zIndex.toast,
      }}
    >
      {children}
    </View>
  );
}
