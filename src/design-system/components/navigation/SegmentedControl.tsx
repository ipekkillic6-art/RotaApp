import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  /** Count shown after the label — "Aktif 3". */
  count?: number;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `pill` is the enclosed iOS segmented control; `underline` is a tab row. */
  variant?: 'pill' | 'underline';
  /** Horizontal scroll when the options do not fit — required past ~3 tabs. */
  scrollable?: boolean;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    pillTrack: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.radius.md,
      padding: 3,
      gap: 3,
    },
    pillItem: {
      flex: 1,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    underlineTrack: {
      flexDirection: 'row',
      borderBottomWidth: theme.borderWidth.hairline,
      borderBottomColor: theme.colors.border.subtle,
    },
    underlineItem: {
      minHeight: theme.touchTarget.min,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 2,
    },
  });

/**
 * Segmented control / tab row.
 *
 * `pill` and `underline` are one component because they are the same
 * selection model; the delivery-history filter uses `underline` with counts,
 * the earnings period picker uses `pill`.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  variant = 'pill',
  scrollable = false,
  accentColor,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentColor ?? theme.colors.action.primary;

  const items = options.map((option) => {
    const active = option.value === value;
    const label =
      option.count !== undefined ? `${option.label} ${option.count}` : option.label;

    return (
      <Touchable
        key={option.value}
        onPress={() => onChange(option.value)}
        feedback="opacity"
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        style={variant === 'pill' && !scrollable ? { flex: 1 } : undefined}
      >
        <View
          style={[
            variant === 'pill' ? styles.pillItem : styles.underlineItem,
            variant === 'pill' && {
              backgroundColor: active ? theme.colors.background.elevated : 'transparent',
            },
            variant === 'underline' && {
              borderBottomColor: active ? accent : 'transparent',
            },
          ]}
        >
          <Typography
            variant="caption"
            color={active ? (variant === 'pill' ? theme.colors.text.primary : accent) : undefined}
            tone={active ? undefined : 'muted'}
            weight={active ? 'semibold' : 'medium'}
            numberOfLines={1}
          >
            {label}
          </Typography>
        </View>
      </Touchable>
    );
  });

  const track = (
    <View
      style={[variant === 'pill' ? styles.pillTrack : styles.underlineTrack, style]}
      accessibilityRole="tablist"
    >
      {items}
    </View>
  );

  if (!scrollable) return track;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {track}
    </ScrollView>
  );
}
