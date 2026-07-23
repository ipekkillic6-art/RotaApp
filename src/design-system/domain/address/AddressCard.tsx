import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Briefcase,
  Home,
  MapPin,
  Pencil,
  Store,
  Warehouse,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Surface } from '../../foundations/Surface';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { IconButton } from '../../components/buttons/IconButton';
import { Badge } from '../../components/data-display/Badge';
import type { Address } from '../../../types';

export type AddressCardVariant = 'pickup' | 'dropoff' | 'saved' | 'compact';

export interface AddressCardProps {
  address: Address;
  variant?: AddressCardVariant;
  selected?: boolean;
  onPress?: () => void;
  /** Shows a pencil affordance; omit for read-only contexts. */
  onEdit?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Guesses an icon from the saved-address title — purely cosmetic. */
function iconForTitle(title: string): LucideIcon {
  const t = title.toLocaleLowerCase('tr');
  if (t.includes('ev')) return Home;
  if (t.includes('ofis') || t.includes('iş')) return Briefcase;
  if (t.includes('mağaza') || t.includes('dükkan')) return Store;
  if (t.includes('depo')) return Warehouse;
  return MapPin;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  });

/**
 * A single address as a card — saved list, picker result, or the read-only
 * pickup/dropoff summary on a confirmation screen.
 *
 * `variant` changes the label and accent; it does not change the anatomy,
 * which is why one component covers all four cases.
 */
export function AddressCard({
  address,
  variant = 'saved',
  selected = false,
  onPress,
  onEdit,
  style,
}: AddressCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const compact = variant === 'compact';

  const accent =
    variant === 'dropoff' ? theme.colors.feedback.success : theme.colors.action.primary;

  const label =
    variant === 'pickup' ? 'Alış adresi' : variant === 'dropoff' ? 'Teslimat adresi' : undefined;

  const content = (
    <View style={styles.row}>
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: selected
                ? theme.colors.action.secondary
                : theme.colors.background.secondary,
              width: compact ? 32 : 40,
              height: compact ? 32 : 40,
            },
          ]}
        >
          <Icon
            icon={variant === 'saved' || compact ? iconForTitle(address.title) : MapPin}
            size={compact ? 'sm' : 'md'}
            color={selected ? accent : theme.colors.text.secondary}
          />
        </View>

        <View style={styles.body}>
          {label && (
            <Typography variant="micro" tone="muted" overline>
              {label}
            </Typography>
          )}
          <View style={styles.titleRow}>
            <Typography variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {address.title}
            </Typography>
            {!compact && (
              <Badge label={address.district} tone="neutral" size="sm" />
            )}
          </View>
          <Typography variant="micro" tone="secondary" numberOfLines={compact ? 1 : 2}>
            {address.fullAddress}
          </Typography>
          {!compact && address.contactName && (
            <Typography variant="micro" tone="muted" numberOfLines={1}>
              {address.contactName}
              {address.contactPhone ? ` · ${address.contactPhone}` : ''}
            </Typography>
          )}
        </View>

    </View>
  );

  return (
    <Surface
      tone="elevated"
      radius={compact ? 'md' : 'lg'}
      padding={compact ? 'md' : 'lg'}
      bordered
      borderColor={selected ? accent : undefined}
      style={style}
    >
      <View style={styles.row}>
        {onPress ? (
          <Touchable
            onPress={onPress}
            feedback="card"
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${address.title}, ${address.fullAddress}`}
            style={{ flex: 1 }}
          >
            {content}
          </Touchable>
        ) : (
          <View style={{ flex: 1 }}>{content}</View>
        )}

        {/* Edit sits outside the tappable region — see the note in DeliveryCard. */}
        {onEdit && (
          <IconButton
            icon={Pencil}
            accessibilityLabel={`${address.title} adresini düzenle`}
            onPress={onEdit}
            size="sm"
          />
        )}
      </View>
    </Surface>
  );
}
