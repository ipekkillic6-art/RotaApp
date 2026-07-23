import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';
import type { Address } from '../../../types';

export interface AddressBlockProps {
  pickup: Address;
  dropoff: Address;
  /** `compact` hides the district line and tightens the rail. */
  variant?: 'default' | 'compact';
  /** Shows contact name/phone under each address. */
  showContacts?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.md },
    rail: { width: 12, alignItems: 'center', paddingTop: 5 },
    dot: { width: 10, height: 10, borderRadius: theme.radius.full },
    square: { width: 10, height: 10, borderRadius: 2 },
    connector: { width: 2, flex: 1, marginVertical: 3, borderRadius: 1 },
    body: { flex: 1, gap: theme.spacing.md },
    entry: { gap: 1 },
  });

/**
 * The pickup → dropoff pair, rendered as one connected object.
 *
 * A round marker for pickup and a square for dropoff: the shapes distinguish
 * the two ends even in greyscale, which two coloured dots would not. This is
 * the single most repeated block in the product, so it is worth the rail.
 */
export function AddressBlock({
  pickup,
  dropoff,
  variant = 'default',
  showContacts = false,
  style,
}: AddressBlockProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const compact = variant === 'compact';

  const entry = (address: Address, isPickup: boolean) => (
    <View style={styles.entry}>
      <Typography variant="micro" tone="muted" overline>
        {isPickup ? 'Alış' : 'Teslimat'}
        {!compact && ` · ${address.district}`}
      </Typography>
      <Typography variant={compact ? 'bodySm' : 'bodyStrong'} numberOfLines={compact ? 1 : 2}>
        {address.title}
      </Typography>
      <Typography variant="micro" tone="secondary" numberOfLines={compact ? 1 : 2}>
        {address.fullAddress}
      </Typography>
      {showContacts && address.contactName && (
        <Typography variant="micro" tone="muted" numberOfLines={1}>
          {address.contactName}
          {address.contactPhone ? ` · ${address.contactPhone}` : ''}
        </Typography>
      )}
      {showContacts && address.note && (
        <Typography variant="micro" tone="accent" numberOfLines={2}>
          Not: {address.note}
        </Typography>
      )}
    </View>
  );

  return (
    <View style={[styles.row, style]}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: theme.colors.action.primary }]} />
        <View style={[styles.connector, { backgroundColor: theme.colors.border.default }]} />
        <View style={[styles.square, { backgroundColor: theme.colors.feedback.success }]} />
      </View>

      <View style={[styles.body, compact && { gap: theme.spacing.sm }]}>
        {entry(pickup, true)}
        {entry(dropoff, false)}
      </View>
    </View>
  );
}
