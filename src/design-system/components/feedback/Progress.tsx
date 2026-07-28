import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    track: {
      height: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background.secondary,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: theme.radius.full },
    spinnerBlock: { alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
    stepRow: { flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' },
    stepSegment: { flex: 1, height: 4, borderRadius: theme.radius.full },
  });

export interface ProgressBarProps {
  /** 0–1. */
  value: number;
  /** Announced and rendered above the bar. */
  label?: string;
  /** Shows the percentage on the right of the label row. */
  showValue?: boolean;
  tone?: 'brand' | 'success' | 'warning' | 'error';
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  tone = 'brand',
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const clamped = Math.max(0, Math.min(1, value));
  const width = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    if (theme.reducedMotion) {
      width.setValue(clamped);
      return;
    }
    Animated.timing(width, {
      toValue: clamped,
      duration: theme.duration.deliberate,
      easing: theme.easing.enter,
      useNativeDriver: false,
    }).start();
  }, [clamped, width, theme]);

  const color =
    tone === 'brand' ? theme.colors.action.primary : theme.colors.feedback[tone];

  return (
    <View style={[{ gap: theme.spacing.xs }, style]}>
      {(label || showValue) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {label && (
            <Typography variant="micro" tone="secondary">
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="micro" tone="muted" tabular>
              %{Math.round(clamped * 100)}
            </Typography>
          )}
        </View>
      )}
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: width.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

export interface StepProgressProps {
  /** 1-based index of the active step. */
  current: number;
  total: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/** Segmented progress for multi-step forms — reads faster than a percentage. */
export function StepProgress({ current, total, label, style }: StepProgressProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[{ gap: theme.spacing.sm }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {label && (
          <Typography variant="micro" tone="secondary">
            {label}
          </Typography>
        )}
        <Typography variant="micro" tone="muted" tabular>
          {current}/{total}
        </Typography>
      </View>
      <View
        style={styles.stepRow}
        accessibilityRole="progressbar"
        accessibilityLabel={label ?? 'Adım'}
        accessibilityValue={{ min: 1, max: total, now: current }}
      >
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.stepSegment,
              {
                backgroundColor:
                  i < current
                    ? theme.colors.action.primary
                    : theme.colors.background.secondary,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export interface LoadingSpinnerProps {
  /** Status line under the spinner — always say what is loading. */
  label?: string;
  size?: 'small' | 'large';
  /** Fills the available space and centres — the full-screen loading state. */
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LoadingSpinner({
  label,
  size = 'large',
  fullscreen = false,
  style,
}: LoadingSpinnerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Yükleniyor'}
      style={[
        styles.spinnerBlock,
        fullscreen && { flex: 1, padding: theme.spacing['3xl'] },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={theme.colors.action.primary} />
      {label && (
        <Typography variant="bodySm" tone="secondary" align="center">
          {label}
        </Typography>
      )}
    </View>
  );
}

/**
 * Pull-to-refresh indicator.
 *
 * Rendered above a list while `refreshing`; the real app wires RN's
 * `RefreshControl` and can drop this. It exists so the refreshing state is
 * reviewable in Storybook, where there is no pull gesture.
 */
export function RefreshIndicator({ refreshing }: { refreshing: boolean }) {
  const theme = useTheme();
  if (!refreshing) return null;
  return (
    <View
      style={{
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.sm,
      }}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="small" color={theme.colors.action.primary} />
      <Typography variant="micro" tone="secondary">
        Güncelleniyor…
      </Typography>
    </View>
  );
}
