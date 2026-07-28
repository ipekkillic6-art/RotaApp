import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Clock, Route, User } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Divider } from '../../foundations/Layout';
import { Surface } from '../../foundations/Surface';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { Button } from '../../components/buttons/Button';
import { Avatar } from '../../components/data-display/Avatar';
import { MetaItem, Price } from '../../components/data-display/Primitives';
import { AddressBlock } from '../address/AddressBlock';
import { StatusBadge } from './StatusBadge';
import { packageTypeMeta } from './status';
import type { Delivery } from '../../../types';
import { formatDistance, formatDuration } from '../../../utils/format';

export type DeliveryCardVariant = 'customer' | 'courier' | 'admin' | 'compact';

export interface DeliveryCardAction {
  label: string;
  onPress: () => void;
  /** Marks an irreversible action — "Reddet", "İptal et". */
  destructive?: boolean;
  loading?: boolean;
}

export interface DeliveryCardProps {
  delivery: Delivery;
  /** Who is looking. Drives which facts are surfaced, not just the styling. */
  variant?: DeliveryCardVariant;
  onPress?: () => void;
  /** Filled CTA at the bottom of the card. */
  primaryAction?: DeliveryCardAction;
  /** Outlined companion action beside the primary. */
  secondaryAction?: DeliveryCardAction;
  /** Draws an accent edge — used for the one card the user must act on. */
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    headerText: { flex: 1, gap: 2 },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    courierRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    courierText: { flex: 1, gap: 1 },
    actions: { flexDirection: 'row', gap: theme.spacing.sm },
    action: { flex: 1 },
  });

/**
 * The delivery, as a card.
 *
 * `variant` is the whole API surface for "who is this for" — the alternative,
 * a dozen `showX` booleans, produces call sites nobody can read and states
 * nobody tests. Each variant answers the question that role actually asks:
 *
 *   customer  where is my package and when does it arrive
 *   courier   what is the job, how far, how much
 *   admin     which delivery is this, who has it, is it late
 *   compact   one line in a dense list
 *
 * Missing data is rendered as missing (a courier that is not assigned, a
 * price that has not been calculated) rather than faked with a placeholder.
 */
export function DeliveryCard({
  delivery,
  variant = 'customer',
  onPress,
  primaryAction,
  secondaryAction,
  highlighted = false,
  style,
}: DeliveryCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const pkg = packageTypeMeta(delivery.packageType);
  const compact = variant === 'compact';
  const isTerminal =
    delivery.status === 'delivered' ||
    delivery.status === 'failed' ||
    delivery.status === 'cancelled';

  // Everything above the action row is one tappable region. The actions are
  // deliberately OUTSIDE it: a button nested inside a pressable card fires both
  // handlers on web and is ambiguous on native, so "Kurye ata" would also open
  // the detail screen.
  const content = (
    <View style={{ gap: compact ? theme.spacing.sm : theme.spacing.md }}>
      {/* ── Header: tracking number + status ─────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Typography variant="micro" tone="muted" overline tabular>
            {delivery.trackingNumber}
          </Typography>
          {variant === 'admin' && (
            <Typography variant="bodyStrong" numberOfLines={1}>
              {delivery.customerName}
            </Typography>
          )}
          {compact && (
            <Typography variant="bodySm" numberOfLines={1}>
              {delivery.pickupAddress.district} → {delivery.dropoffAddress.district}
            </Typography>
          )}
        </View>
        <StatusBadge status={delivery.status} delayed={delivery.isDelayed} />
      </View>

      {/* ── Route ────────────────────────────────────────────────────── */}
      {!compact && (
        <AddressBlock
          pickup={delivery.pickupAddress}
          dropoff={delivery.dropoffAddress}
          variant={variant === 'admin' ? 'compact' : 'default'}
        />
      )}

      {/* ── Facts row ────────────────────────────────────────────────── */}
      <View style={styles.metaRow}>
        <MetaItem icon={pkg.icon} label={pkg.label} />
        <MetaItem icon={Route} label={formatDistance(delivery.distanceKm)} />
        <MetaItem
          icon={Clock}
          label={
            isTerminal
              ? formatDuration(delivery.estimatedDurationMinutes)
              : `~${formatDuration(delivery.estimatedDurationMinutes)}`
          }
        />
        {variant !== 'compact' && (
          <View style={{ marginLeft: 'auto' }}>
            <Price
              amount={delivery.price?.total}
              size={variant === 'courier' ? 'md' : 'sm'}
              tone={variant === 'courier' ? 'success' : 'primary'}
            />
          </View>
        )}
      </View>

      {/* ── Courier ──────────────────────────────────────────────────── */}
      {(variant === 'customer' || variant === 'admin') && !compact && (
        <>
          <Divider />
          {delivery.courier ? (
            <View style={styles.courierRow}>
              <Avatar
                name={delivery.courier.fullName}
                imageUrl={delivery.courier.avatarUrl}
                size="sm"
              />
              <View style={styles.courierText}>
                <Typography variant="caption" numberOfLines={1}>
                  {delivery.courier.fullName}
                </Typography>
                <Typography variant="micro" tone="muted">
                  {delivery.courier.rating.toFixed(1)} ·{' '}
                  {delivery.courier.completedDeliveries} teslimat
                </Typography>
              </View>
            </View>
          ) : (
            <View style={styles.courierRow}>
              <MetaItem icon={User} label="Kurye atanmadı" tone="muted" />
            </View>
          )}
        </>
      )}

      {/* ── Failure reason ───────────────────────────────────────────── */}
      {delivery.status === 'failed' && delivery.failureNote && !compact && (
        <Typography variant="micro" tone="danger" numberOfLines={2}>
          {delivery.failureNote}
        </Typography>
      )}
    </View>
  );

  return (
    <Surface
      tone="elevated"
      radius="lg"
      padding={compact ? 'md' : 'lg'}
      elevation={highlighted ? 'md' : 'sm'}
      bordered
      borderColor={highlighted ? theme.colors.action.primary : undefined}
      style={[{ gap: compact ? theme.spacing.sm : theme.spacing.md }, style]}
    >
      {onPress ? (
        <Touchable
          onPress={onPress}
          feedback="card"
          accessibilityRole="button"
          accessibilityLabel={`${delivery.trackingNumber}, ${delivery.pickupAddress.district} - ${delivery.dropoffAddress.district}`}
        >
          {content}
        </Touchable>
      ) : (
        content
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {secondaryAction && (
            <View style={styles.action}>
              <Button
                label={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant={secondaryAction.destructive ? 'danger' : 'tertiary'}
                size="sm"
                loading={secondaryAction.loading}
              />
            </View>
          )}
          {primaryAction && (
            <View style={styles.action}>
              <Button
                label={primaryAction.label}
                onPress={primaryAction.onPress}
                variant={primaryAction.destructive ? 'danger' : 'primary'}
                size="sm"
                loading={primaryAction.loading}
              />
            </View>
          )}
        </View>
      )}
    </Surface>
  );
}
