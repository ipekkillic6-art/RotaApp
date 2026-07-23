import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../themes';
import { Badge, type BadgeSize } from '../../components/data-display/Badge';
import type { DeliveryStatus } from '../../../types';
import { DELAYED_META, STATUS_META, statusPalette } from './status';

export interface StatusBadgeProps {
  status: DeliveryStatus;
  size?: BadgeSize;
  /** Adds a second "Gecikti" badge — a delay is an overlay, not a status. */
  delayed?: boolean;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});

/**
 * The canonical way a delivery status is shown, anywhere in the product.
 *
 * Icon + Turkish label + colour, always all three. Screens never build their
 * own status pill, which is what keeps "Yolda" identical in a customer card,
 * a courier task row and an ops table.
 */
export function StatusBadge({ status, size = 'sm', delayed, style }: StatusBadgeProps) {
  const theme = useTheme();
  const meta = STATUS_META[status];
  const palette = statusPalette(theme, status);

  return (
    <View style={[styles.row, { gap: theme.spacing.xs }, style]}>
      <Badge
        label={meta.label}
        icon={meta.icon}
        size={size}
        colors={palette}
      />
      {delayed && (
        <Badge
          label={DELAYED_META.label}
          icon={DELAYED_META.icon}
          size={size}
          colors={{
            color: theme.colors.status.delayed,
            surface: theme.colors.statusSurface.delayed,
          }}
        />
      )}
    </View>
  );
}
