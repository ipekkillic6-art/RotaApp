import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';
import { formatDateTime, formatPrice, formatRating } from '../../../utils/format';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs },
  });

export interface RatingProps {
  value: number;
  /** Adds "(1.284)" after the score. */
  count?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/**
 * Rating.
 *
 * One star plus a number, not five stars: at 13px a five-star row is noise,
 * and the numeric value is what a dispatcher actually compares.
 */
export function Rating({ value, count, size = 'sm', style }: RatingProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View
      style={[styles.row, style]}
      accessibilityLabel={`${formatRating(value)} yıldız${count ? `, ${count} değerlendirme` : ''}`}
    >
      <Icon icon={Star} size={size === 'sm' ? 13 : 16} color={theme.colors.feedback.warning} strokeWidth={2.5} />
      <Typography variant={size === 'sm' ? 'micro' : 'caption'} weight="semibold" tabular>
        {formatRating(value)}
      </Typography>
      {count !== undefined && (
        <Typography variant="micro" tone="muted" tabular>
          ({count})
        </Typography>
      )}
    </View>
  );
}

export interface PriceProps {
  amount?: number;
  /** `lg` for the summary total, `md` on cards, `sm` in dense rows. */
  size?: 'sm' | 'md' | 'lg';
  /** Renders as a struck-through original price. */
  strikethrough?: boolean;
  tone?: 'primary' | 'secondary' | 'success' | 'muted';
  /** Text shown when the amount is undefined. */
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Money.
 *
 * Handles `undefined` explicitly: a delivery can exist before it is priced,
 * and rendering "0,00 ₺" there would be a lie.
 */
export function Price({
  amount,
  size = 'md',
  strikethrough = false,
  tone = 'primary',
  emptyLabel = 'Fiyat yok',
  style,
}: PriceProps) {
  const variant = size === 'lg' ? 'h2' : size === 'md' ? 'bodyStrong' : 'caption';

  if (amount === undefined) {
    return (
      <Typography variant={variant} tone="muted" style={style}>
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <Typography
      variant={variant}
      tone={tone === 'success' ? 'success' : tone === 'primary' ? 'primary' : tone === 'muted' ? 'muted' : 'secondary'}
      tabular
      style={[strikethrough && { textDecorationLine: 'line-through' }, style]}
    >
      {formatPrice(amount)}
    </Typography>
  );
}

export interface DateTimeProps {
  /** ISO timestamp. */
  value: string;
  /** Prefix label, e.g. "Oluşturuldu". */
  label?: string;
  tone?: 'secondary' | 'muted';
  style?: StyleProp<ViewStyle>;
}

export function DateTime({ value, label, tone = 'secondary', style }: DateTimeProps) {
  return (
    <Typography variant="micro" tone={tone} tabular style={style}>
      {label ? `${label} · ` : ''}
      {formatDateTime(value)}
    </Typography>
  );
}

export interface MetaItemProps {
  icon: React.ComponentProps<typeof Icon>['icon'];
  label: string;
  tone?: 'secondary' | 'muted' | 'primary';
}

/** Icon + value pair used across cards for distance, duration and counts. */
export function MetaItem({ icon, label, tone = 'secondary' }: MetaItemProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.row}>
      <Icon icon={icon} size="xs" tone="muted" />
      <Typography variant="micro" tone={tone} tabular numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}
