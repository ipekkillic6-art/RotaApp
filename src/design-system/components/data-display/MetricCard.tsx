import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Surface } from '../../foundations/Surface';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { Skeleton } from '../feedback/Skeleton';

export type MetricTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

export interface MetricCardProps {
  label: string;
  /** Pre-formatted — the card does not know whether this is money or a count. */
  value: string;
  icon?: LucideIcon;
  tone?: MetricTone;
  /** Small line under the value: "dünden %12 fazla". */
  caption?: string;
  /** Direction arrow beside the caption. */
  trend?: 'up' | 'down';
  /** Whether an upward trend is good — an "iptal" metric inverts this. */
  trendPositiveIsGood?: boolean;
  onPress?: () => void;
  loading?: boolean;
  /** `compact` drops the icon well for dense dashboard grids. */
  variant?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    iconWell: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing['2xs'] },
  });

/**
 * A single number with a label — the dashboard's atom.
 *
 * `value` is a pre-formatted string on purpose: the card must not decide
 * whether 4280 is "4.280 ₺", "4.280" or "%42,80".
 */
export function MetricCard({
  label,
  value,
  icon,
  tone = 'neutral',
  caption,
  trend,
  trendPositiveIsGood = true,
  onPress,
  loading = false,
  variant = 'default',
  style,
}: MetricCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const toneColor = {
    neutral: theme.colors.text.secondary,
    brand: theme.colors.text.accent,
    success: theme.colors.feedback.success,
    warning: theme.colors.feedback.warning,
    error: theme.colors.feedback.error,
  }[tone];

  const toneSurface = {
    neutral: theme.colors.background.secondary,
    brand: theme.colors.action.secondary,
    success: theme.colors.feedback.successSurface,
    warning: theme.colors.feedback.warningSurface,
    error: theme.colors.feedback.errorSurface,
  }[tone];

  const trendIsGood = trend === 'up' ? trendPositiveIsGood : !trendPositiveIsGood;
  const trendColor = trend
    ? trendIsGood
      ? theme.colors.feedback.success
      : theme.colors.feedback.error
    : undefined;

  const body = (
    <Surface
      tone="elevated"
      radius="lg"
      padding="lg"
      bordered
      style={[{ gap: theme.spacing.sm }, style]}
    >
      <View style={styles.header}>
        <Typography variant="micro" tone="muted" numberOfLines={2} style={{ flex: 1 }}>
          {label}
        </Typography>
        {icon && variant === 'default' && (
          <View style={[styles.iconWell, { backgroundColor: toneSurface }]}>
            <Icon icon={icon} size="sm" color={toneColor} />
          </View>
        )}
      </View>

      {loading ? (
        <Skeleton width={72} height={26} />
      ) : (
        <Typography
          variant={variant === 'compact' ? 'h3' : 'h1'}
          color={tone === 'neutral' ? undefined : toneColor}
          tabular
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Typography>
      )}

      {caption && !loading && (
        <View style={styles.trendRow}>
          {trend && (
            <Icon
              icon={trend === 'up' ? TrendingUp : TrendingDown}
              size="xs"
              color={trendColor}
            />
          )}
          <Typography variant="micro" color={trendColor} tone={trend ? undefined : 'muted'}>
            {caption}
          </Typography>
        </View>
      )}
    </Surface>
  );

  if (!onPress) return body;

  return (
    <Touchable onPress={onPress} feedback="card" accessibilityLabel={`${label}: ${value}`}>
      {body}
    </Touchable>
  );
}
