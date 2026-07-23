import React from 'react';
import { View } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import {
  AppHeader,
  Divider,
  NotificationItem,
  ScrollContainer,
  StateView,
  STATE_PRESETS,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { AppNotification, UserRole } from '../../types';

export interface NotificationsScreenProps {
  notifications: AppNotification[];
  role?: UserRole;
  activeTab?: string;
  onOpen?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
  onBack?: () => void;
  onTabChange?: (key: string) => void;
}

/**
 * Notification inbox.
 *
 * Critical items are pulled to the top and keep their badge after "mark all
 * read" — an ops alert that quietly greys out is an ops alert that gets
 * missed.
 */
export function NotificationsScreen({
  notifications,
  role = 'customer',
  activeTab = 'notifications',
  onOpen,
  onMarkAllRead,
  onBack,
  onTabChange,
}: NotificationsScreenProps) {
  const theme = useTheme();

  const critical = notifications.filter((n) => n.critical);
  const rest = notifications.filter((n) => !n.critical);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabsAvailable = role === 'customer';

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Bildirimler"
          subtitle={unreadCount > 0 ? `${unreadCount} okunmamış` : undefined}
          onBack={onBack}
          actions={
            unreadCount > 0
              ? [
                  {
                    icon: CheckCheck,
                    accessibilityLabel: 'Tümünü okundu işaretle',
                    onPress: onMarkAllRead ?? (() => {}),
                  },
                ]
              : []
          }
          bordered
        />
      }
      role={role}
      activeTab={tabsAvailable ? activeTab : undefined}
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer padded={false} bottomInset={tabsAvailable ? theme.chrome.tabBar : 0}>
        {notifications.length === 0 ? (
          <StateView {...STATE_PRESETS.noNotifications} fullHeight />
        ) : (
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
            {critical.length > 0 && (
              <View style={{ gap: theme.spacing.xs }}>
                <Typography
                  variant="micro"
                  tone="muted"
                  overline
                  style={{ paddingHorizontal: theme.layout.screenPaddingX }}
                >
                  Kritik
                </Typography>
                <Surface tone="elevated" style={{ overflow: 'hidden' }}>
                  {critical.map((n, i) => (
                    <React.Fragment key={n.id}>
                      {i > 0 && <Divider inset={68} />}
                      <NotificationItem notification={n} onPress={() => onOpen?.(n)} />
                    </React.Fragment>
                  ))}
                </Surface>
              </View>
            )}

            <View style={{ gap: theme.spacing.xs }}>
              <Typography
                variant="micro"
                tone="muted"
                overline
                style={{ paddingHorizontal: theme.layout.screenPaddingX }}
              >
                Tümü
              </Typography>
              <Surface tone="elevated" style={{ overflow: 'hidden' }}>
                {rest.map((n, i) => (
                  <React.Fragment key={n.id}>
                    {i > 0 && <Divider inset={68} />}
                    <NotificationItem notification={n} onPress={() => onOpen?.(n)} />
                  </React.Fragment>
                ))}
              </Surface>
            </View>
          </View>
        )}
      </ScrollContainer>
    </ScreenScaffold>
  );
}
