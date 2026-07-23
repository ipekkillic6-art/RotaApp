import React from 'react';
import { RefreshControl, View } from 'react-native';
import { Bell, ChevronRight, Percent, Plus } from 'lucide-react-native';
import {
  AddressCard,
  AppHeader,
  Avatar,
  Button,
  DeliveryCard,
  Icon,
  ScrollContainer,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  Surface,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { Address, Delivery } from '../../types';

export interface CustomerHomeScreenProps {
  userName: string;
  activeDeliveries: Delivery[];
  recentAddresses: Address[];
  pastDeliveries: Delivery[];
  unreadNotifications?: number;
  loading?: boolean;
  errorText?: string;
  offline?: boolean;
  /** Pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
  onCreateDelivery?: () => void;
  onOpenDelivery?: (delivery: Delivery) => void;
  onOpenNotifications?: () => void;
  onRetry?: () => void;
  /** Bottom-navigation wiring. Omit and the tab bar is display-only. */
  onTabChange?: (key: string) => void;
}

/**
 * Customer home.
 *
 * The screen is ordered by urgency, not by feature: an in-flight delivery is
 * the only thing that matters when there is one, so it sits above the create
 * CTA. With nothing in flight, the CTA becomes the hero instead.
 */
export function CustomerHomeScreen({
  userName,
  activeDeliveries,
  recentAddresses,
  pastDeliveries,
  unreadNotifications,
  loading = false,
  errorText,
  offline = false,
  refreshing = false,
  onRefresh,
  onCreateDelivery,
  onOpenDelivery,
  onOpenNotifications,
  onRetry,
  onTabChange,
}: CustomerHomeScreenProps) {
  const theme = useTheme();
  const hasActive = activeDeliveries.length > 0;

  const header = (
    <AppHeader
      leading={<Avatar name={userName} size="sm" />}
      center={
        <View style={{ paddingLeft: theme.spacing.xs }}>
          <Typography variant="micro" tone="muted">
            Merhaba
          </Typography>
          <Typography variant="bodyStrong" numberOfLines={1}>
            {userName}
          </Typography>
        </View>
      }
      actions={[
        {
          icon: Bell,
          accessibilityLabel: unreadNotifications
            ? `${unreadNotifications} okunmamış bildirim`
            : 'Bildirimler',
          onPress: onOpenNotifications ?? (() => {}),
          badge: unreadNotifications,
        },
      ]}
    />
  );

  return (
    <ScreenScaffold
      header={header}
      role="customer"
      activeTab="home"
      onTabChange={onTabChange}
      offline={offline}
      tone="sunken"
    >
      <ScrollContainer
        bottomInset={theme.chrome.tabBar}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.role.customer}
            />
          ) : undefined
        }
      >
        {errorText ? (
          <StateView
            {...STATE_PRESETS.serverError}
            description={errorText}
            primaryAction={onRetry ? { label: 'Tekrar dene', onPress: onRetry } : undefined}
            fullHeight
          />
        ) : loading ? (
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
            <SkeletonList count={2} />
          </View>
        ) : (
          <View style={{ gap: theme.layout.sectionGap, paddingTop: theme.spacing.md }}>
            {/* ── Active deliveries ─────────────────────────────────── */}
            {hasActive ? (
              <View style={{ gap: theme.spacing.md }}>
                <SectionTitle
                  title={
                    activeDeliveries.length > 1
                      ? `${activeDeliveries.length} aktif teslimat`
                      : 'Aktif teslimatın'
                  }
                />
                {activeDeliveries.map((delivery, i) => (
                  <DeliveryCard
                    key={delivery.id + i}
                    delivery={delivery}
                    variant="customer"
                    highlighted={i === 0}
                    onPress={() => onOpenDelivery?.(delivery)}
                  />
                ))}
              </View>
            ) : (
              <Surface tone="brand" radius="xl" padding="xl" style={{ gap: theme.spacing.md }}>
                <Typography variant="h2">Bir şey mi göndereceksin?</Typography>
                <Typography variant="bodySm" tone="secondary">
                  Adresi seç, paketi tanımla — kurye ortalama 10 dakikada kapında.
                </Typography>
                <Button label="Yeni teslimat oluştur" icon={Plus} onPress={onCreateDelivery} />
              </Surface>
            )}

            {hasActive && (
              <Button label="Yeni teslimat oluştur" icon={Plus} onPress={onCreateDelivery} />
            )}

            {/* ── Recent addresses ──────────────────────────────────── */}
            {recentAddresses.length > 0 && (
              <View style={{ gap: theme.spacing.md }}>
                <SectionTitle title="Son adresler" />
                {recentAddresses.slice(0, 3).map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    variant="compact"
                    onPress={onCreateDelivery}
                  />
                ))}
              </View>
            )}

            {/* ── Promo ─────────────────────────────────────────────── */}
            <Surface
              tone="elevated"
              radius="lg"
              padding="lg"
              bordered
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.feedback.warningSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon={Percent} size="md" color={theme.colors.feedback.warning} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="bodyStrong">İlk 3 teslimatta %20</Typography>
                <Typography variant="micro" tone="secondary">
                  ROTA20 kodu ödeme adımında otomatik uygulanır.
                </Typography>
              </View>
            </Surface>

            {/* ── History ───────────────────────────────────────────── */}
            <View style={{ gap: theme.spacing.md }}>
              <SectionTitle title="Teslimat geçmişi" action="Tümü" onPress={() => {}} />
              {pastDeliveries.length === 0 ? (
                <Surface tone="elevated" radius="lg" bordered>
                  <StateView {...STATE_PRESETS.noHistory} size="compact" />
                </Surface>
              ) : (
                pastDeliveries
                  .slice(0, 3)
                  .map((delivery, i) => (
                    <DeliveryCard
                      key={delivery.id + i}
                      delivery={delivery}
                      variant="compact"
                      onPress={() => onOpenDelivery?.(delivery)}
                    />
                  ))
              )}
            </View>
          </View>
        )}
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/** Section heading with an optional trailing link. */
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
      }}
    >
      <Typography variant="h3">{title}</Typography>
      {action && (
        <Touchable onPress={onPress} feedback="opacity" accessibilityLabel={action}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" tone="accent" weight="semibold">
              {action}
            </Typography>
            <Icon icon={ChevronRight} size="sm" tone="accent" />
          </View>
        </Touchable>
      )}
    </View>
  );
}
