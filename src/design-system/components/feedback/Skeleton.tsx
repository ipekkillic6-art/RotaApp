import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../themes';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (_theme: Theme) => StyleSheet.create({ base: { overflow: 'hidden' } });

/**
 * Loading placeholder.
 *
 * Pulses opacity rather than sweeping a gradient: one animated property, no
 * gradient dependency, and it reads identically in both themes. Freezes at
 * full opacity under reduced motion — still a placeholder, just a still one.
 */
export function Skeleton({ width = '100%', height = 14, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (theme.reducedMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: theme.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 700,
          easing: theme.easing.standard,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, theme]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Yükleniyor"
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.skeleton.base,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** Skeleton shaped like a delivery card — the most-loaded surface in the app. */
export function SkeletonCard() {
  const theme = useTheme();
  return (
    <View
      style={{
        padding: theme.layout.cardPadding,
        borderRadius: theme.radiusUsage.card,
        backgroundColor: theme.colors.background.elevated,
        borderWidth: theme.borderWidth.hairline,
        borderColor: theme.colors.border.subtle,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <Skeleton width={110} height={12} />
        <Skeleton width={78} height={22} radius={theme.radius.full} />
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <Skeleton width="90%" height={14} />
        <Skeleton width="70%" height={14} />
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Skeleton width={64} height={12} />
        <Skeleton width={64} height={12} />
        <Skeleton width={48} height={12} />
      </View>
    </View>
  );
}

/** Repeats the card skeleton — the standard list loading state. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.layout.listGap }} accessibilityLabel="Liste yükleniyor">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
