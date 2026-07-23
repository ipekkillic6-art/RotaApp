import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Clock, Layers, Package, Route } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Divider } from '../../foundations/Layout';
import { Surface } from '../../foundations/Surface';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { Button } from '../../components/buttons/Button';
import { Avatar } from '../../components/data-display/Avatar';
import { Badge } from '../../components/data-display/Badge';
import { MetaItem, Rating } from '../../components/data-display/Primitives';
import { VEHICLE_META } from '../delivery/status';
import type { Courier, CourierStatus } from '../../../types';
import { formatDistance, formatDuration } from '../../../utils/format';

export type CourierCardVariant = 'default' | 'assignment' | 'compact';

export interface CourierCardProps {
  courier: Courier;
  /** `assignment` surfaces distance/ETA/load — the facts a dispatcher weighs. */
  variant?: CourierCardVariant;
  onPress?: () => void;
  primaryAction?: { label: string; onPress: () => void; loading?: boolean };
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

const STATUS_LABEL: Record<CourierStatus, { label: string; tone: 'success' | 'warning' | 'neutral' | 'error' }> = {
  available: { label: 'Müsait', tone: 'success' },
  busy: { label: 'Meşgul', tone: 'warning' },
  offline: { label: 'Çevrimdışı', tone: 'neutral' },
  suspended: { label: 'Askıya alınmış', tone: 'error' },
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    body: { flex: 1, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
  });

/**
 * A courier, as seen by ops and by the tracking customer.
 *
 * The `assignment` variant leads with distance and current load because those
 * are the two numbers that decide the assignment; rating is secondary there
 * even though it dominates the default variant.
 */
export function CourierCard({
  courier,
  variant = 'default',
  onPress,
  primaryAction,
  selected = false,
  style,
}: CourierCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const compact = variant === 'compact';
  const vehicle = VEHICLE_META[courier.vehicleType];
  const status = STATUS_LABEL[courier.status];

  // Action stays outside the tappable region — see the note in DeliveryCard.
  const content = (
    <View style={{ gap: theme.spacing.md }}>
      <View style={styles.row}>
        <Avatar
          name={courier.fullName}
          imageUrl={courier.avatarUrl}
          size={compact ? 'sm' : 'md'}
          status={courier.status}
        />

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Typography variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {courier.fullName}
            </Typography>
            <Badge label={status.label} tone={status.tone} size="sm" />
          </View>

          <View style={styles.metaRow}>
            <Rating value={courier.rating} count={compact ? undefined : courier.completedDeliveries} />
            <MetaItem icon={vehicle.icon} label={vehicle.label} />
          </View>
        </View>
      </View>

      {variant === 'assignment' && (
        <>
          <Divider />
          <View style={styles.metaRow}>
            {courier.distanceKm !== undefined && (
              <MetaItem icon={Route} label={formatDistance(courier.distanceKm)} />
            )}
            {courier.etaMinutes !== undefined && (
              <MetaItem icon={Clock} label={formatDuration(courier.etaMinutes)} />
            )}
            <MetaItem icon={Layers} label={`${courier.activeTaskCount} aktif görev`} />
          </View>
        </>
      )}

      {variant === 'default' && !compact && (
        <>
          <Divider />
          <View style={styles.metaRow}>
            <MetaItem icon={Package} label={`Bugün ${courier.todayDeliveries ?? 0} teslimat`} />
            <MetaItem icon={Layers} label={`${courier.activeTaskCount} aktif`} />
          </View>
        </>
      )}

    </View>
  );

  return (
    <Surface
      tone="elevated"
      radius="lg"
      padding={compact ? 'md' : 'lg'}
      bordered
      borderColor={selected ? theme.colors.action.primary : undefined}
      style={[{ gap: theme.spacing.md }, style]}
    >
      {onPress ? (
        <Touchable
          onPress={onPress}
          feedback="card"
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={`${courier.fullName}, ${status.label}, ${courier.rating.toFixed(1)} puan`}
        >
          {content}
        </Touchable>
      ) : (
        content
      )}

      {primaryAction && (
        <Button
          label={primaryAction.label}
          onPress={primaryAction.onPress}
          loading={primaryAction.loading}
          size="sm"
          disabled={courier.status === 'offline' || courier.status === 'suspended'}
        />
      )}
    </Surface>
  );
}
