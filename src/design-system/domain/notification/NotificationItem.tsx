import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  BellRing,
  CheckCircle2,
  CreditCard,
  Navigation,
  PackageCheck,
  ShieldAlert,
  Truck,
  UserCheck,
  XCircle,
  XOctagon,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { Badge } from '../../components/data-display/Badge';
import type { AppNotification, NotificationKind } from '../../../types';
import { formatTime } from '../../../utils/format';

type Tone = 'brand' | 'success' | 'warning' | 'error' | 'neutral';

const KIND_META: Record<NotificationKind, { icon: LucideIcon; tone: Tone }> = {
  courier_assigned: { icon: UserCheck, tone: 'brand' },
  package_picked_up: { icon: PackageCheck, tone: 'brand' },
  courier_on_the_way: { icon: Truck, tone: 'brand' },
  courier_nearby: { icon: Navigation, tone: 'brand' },
  delivery_completed: { icon: CheckCircle2, tone: 'success' },
  delivery_failed: { icon: XCircle, tone: 'error' },
  new_task: { icon: BellRing, tone: 'brand' },
  task_cancelled: { icon: XOctagon, tone: 'warning' },
  payment_completed: { icon: CreditCard, tone: 'success' },
  ops_alert: { icon: ShieldAlert, tone: 'error' },
};

export interface NotificationItemProps {
  notification: AppNotification;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'flex-start',
    },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: theme.radius.full,
      marginTop: 6,
    },
  });

/**
 * One notification row.
 *
 * Unread is carried by a dot, a bolder title and a tinted background — three
 * signals, because a single background tint disappears in dark mode. Critical
 * notifications additionally carry an explicit "Kritik" badge rather than just
 * a red icon.
 */
export function NotificationItem({ notification, onPress, style }: NotificationItemProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const meta = KIND_META[notification.kind];

  const toneColor = {
    brand: theme.colors.text.accent,
    success: theme.colors.feedback.success,
    warning: theme.colors.feedback.warning,
    error: theme.colors.feedback.error,
    neutral: theme.colors.text.secondary,
  }[meta.tone];

  const toneSurface = {
    brand: theme.colors.action.secondary,
    success: theme.colors.feedback.successSurface,
    warning: theme.colors.feedback.warningSurface,
    error: theme.colors.feedback.errorSurface,
    neutral: theme.colors.background.secondary,
  }[meta.tone];

  const body = (
    <View
      style={[
        styles.row,
        !notification.read && { backgroundColor: theme.colors.background.brandSubtle },
        style,
      ]}
    >
      <View style={[styles.iconWell, { backgroundColor: toneSurface }]}>
        <Icon icon={meta.icon} size="md" color={toneColor} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Typography
            variant={notification.read ? 'bodySm' : 'bodyStrong'}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {notification.title}
          </Typography>
          {notification.critical && <Badge label="Kritik" tone="error" size="sm" />}
        </View>
        <Typography variant="micro" tone="secondary" numberOfLines={2}>
          {notification.body}
        </Typography>
        <Typography variant="micro" tone="muted" tabular>
          {formatTime(notification.createdAt)}
        </Typography>
      </View>

      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.action.primary }]} />
      )}
    </View>
  );

  if (!onPress) return body;

  return (
    <Touchable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${notification.read ? '' : 'Okunmamış. '}${notification.title}. ${notification.body}`}
    >
      {body}
    </Touchable>
  );
}
