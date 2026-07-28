import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Gift, Package, Wallet } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Divider } from '../../foundations/Layout';
import { Surface } from '../../foundations/Surface';
import { Typography } from '../../foundations/Typography';
import { MetaItem } from '../../components/data-display/Primitives';
import { Skeleton } from '../../components/feedback/Skeleton';
import type { EarningsPeriod } from '../../../types';
import { formatPrice } from '../../../utils/format';

export interface EarningsCardProps {
  period: EarningsPeriod;
  /** Amount awaiting the next payout run. */
  pendingPayout?: number;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.lg,
    },
    payoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
  });

/**
 * Courier earnings for one period.
 *
 * The headline number is the total; bonus and per-delivery average sit under
 * it because they answer "was today worth it" rather than "how much do I
 * have". Pending payout is separated by a divider — it is money not yet in
 * the account, and blurring that line is how trust is lost.
 */
export function EarningsCard({
  period,
  pendingPayout,
  loading = false,
  style,
}: EarningsCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Surface
      tone="elevated"
      radius="xl"
      padding="xl"
      elevation="sm"
      bordered
      style={[{ gap: theme.spacing.md }, style]}
    >
      <View style={styles.header}>
        <Icon icon={Wallet} size="md" tone="accent" />
        <Typography variant="micro" tone="muted" overline>
          {period.label} kazancı
        </Typography>
      </View>

      {loading ? (
        <Skeleton width={160} height={34} />
      ) : (
        <Typography variant="display" tone="success" tabular>
          {formatPrice(period.amount, { compact: true })}
        </Typography>
      )}

      <View style={styles.metaRow}>
        <MetaItem icon={Package} label={`${period.deliveries} teslimat`} />
        <MetaItem icon={Gift} label={`${formatPrice(period.bonus, { compact: true })} bonus`} />
        <MetaItem
          icon={Wallet}
          label={`Ort. ${formatPrice(period.averagePerDelivery, { compact: true })}`}
        />
      </View>

      {pendingPayout !== undefined && (
        <>
          <Divider />
          <View style={styles.payoutRow}>
            <Typography variant="caption" tone="secondary">
              Bekleyen ödeme
            </Typography>
            <Typography variant="bodyStrong" tabular>
              {formatPrice(pendingPayout, { compact: true })}
            </Typography>
          </View>
        </>
      )}
    </Surface>
  );
}
