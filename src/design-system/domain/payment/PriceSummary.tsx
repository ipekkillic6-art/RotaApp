import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../themes';
import { Divider } from '../../foundations/Layout';
import { Surface } from '../../foundations/Surface';
import { Typography } from '../../foundations/Typography';
import { Skeleton } from '../../components/feedback/Skeleton';
import { StateView } from '../../components/states/StateView';
import { STATE_PRESETS } from '../../components/states/presets';
import type { PriceBreakdown } from '../../../types';
import { formatDistance, formatPrice } from '../../../utils/format';

export interface PriceSummaryProps {
  /** `undefined` renders the "could not be priced" state, not a zero total. */
  price?: PriceBreakdown;
  /** Adds "11,4 km için" to the distance line. */
  distanceKm?: number;
  loading?: boolean;
  /** Retry handler shown when pricing failed. */
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    line: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      minHeight: 26,
    },
    label: { flex: 1 },
  });

/**
 * The price, itemised.
 *
 * Every line is shown even when it is zero, except the discount — a "0,00 ₺
 * indirim" line invites the question "why is there no discount". The total is
 * the only bold row, so it survives a glance.
 */
export function PriceSummary({
  price,
  distanceKm,
  loading = false,
  onRetry,
  style,
}: PriceSummaryProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  if (loading) {
    return (
      <Surface tone="elevated" radius="lg" padding="lg" bordered style={[{ gap: theme.spacing.md }, style]}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="45%" height={14} />
        <Divider />
        <Skeleton width="35%" height={22} />
      </Surface>
    );
  }

  if (!price) {
    return (
      <Surface tone="elevated" radius="lg" padding="lg" bordered style={style}>
        <StateView
          {...STATE_PRESETS.genericError}
          title="Fiyat hesaplanamadı"
          description="Adresler arasındaki mesafeyi şu anda hesaplayamıyoruz."
          size="compact"
          primaryAction={onRetry ? { label: 'Tekrar dene', onPress: onRetry } : undefined}
        />
      </Surface>
    );
  }

  const line = (label: string, amount: number, tone: 'secondary' | 'success' = 'secondary') => (
    <View style={styles.line}>
      <Typography variant="bodySm" tone="secondary" style={styles.label}>
        {label}
      </Typography>
      <Typography
        variant="bodySm"
        tone={tone === 'success' ? 'success' : 'primary'}
        tabular
      >
        {tone === 'success' ? '−' : ''}
        {formatPrice(amount)}
      </Typography>
    </View>
  );

  return (
    <Surface
      tone="elevated"
      radius="lg"
      padding="lg"
      bordered
      style={[{ gap: theme.spacing.xs }, style]}
    >
      {line('Temel ücret', price.base)}
      {line(
        distanceKm ? `Mesafe ücreti · ${formatDistance(distanceKm)}` : 'Mesafe ücreti',
        price.distance,
      )}
      {line('Ek hizmetler', price.extras)}
      {price.discount > 0 && line('İndirim', price.discount, 'success')}

      <Divider style={{ marginVertical: theme.spacing.sm }} />

      <View style={styles.line}>
        <Typography variant="h3" style={styles.label}>
          Toplam
        </Typography>
        <Typography variant="h2" tabular>
          {formatPrice(price.total)}
        </Typography>
      </View>
    </Surface>
  );
}
