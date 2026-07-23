import React from 'react';
import { View } from 'react-native';
import { LifeBuoy, MessageSquare, Phone } from 'lucide-react-native';
import {
  AddressBlock,
  AppHeader,
  Avatar,
  Button,
  DeliveryCodeCard,
  DeliveryStatusStepper,
  DeliveryTimeline,
  Divider,
  IconButton,
  InlineAlert,
  MapPreview,
  Rating,
  ScrollContainer,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDuration } from '../../utils/format';
import type { Delivery } from '../../types';

export interface TrackDeliveryScreenProps {
  delivery: Delivery;
  locationPermission?: 'granted' | 'denied';
  offline?: boolean;
  onBack?: () => void;
  onCallCourier?: () => void;
  onMessageCourier?: () => void;
  onSupport?: () => void;
}

/**
 * Live tracking.
 *
 * Ordered by what the customer looks at, in order: where is it (map), how long
 * (ETA), who has it (courier), what is the handover code, and only then the
 * full history. The delivery code sits above the fold once the package is
 * picked up, because that is when it is needed at the door.
 */
export function TrackDeliveryScreen({
  delivery,
  locationPermission = 'granted',
  offline = false,
  onBack,
  onCallCourier,
  onMessageCourier,
  onSupport,
}: TrackDeliveryScreenProps) {
  const theme = useTheme();
  const courier = delivery.courier;
  const inTransit = delivery.status === 'picked_up' || delivery.status === 'on_the_way';

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Teslimat takibi"
          subtitle={delivery.trackingNumber}
          onBack={onBack}
          actions={[
            { icon: LifeBuoy, accessibilityLabel: 'Destek', onPress: onSupport ?? (() => {}) },
          ]}
          bordered
        />
      }
      offline={offline}
      tone="sunken"
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <MapPreview
            height={200}
            showCourier={inTransit}
            caption={
              inTransit
                ? `Tahmini varış ${formatDuration(delivery.estimatedDurationMinutes)}`
                : undefined
            }
            permissionDenied={locationPermission === 'denied'}
            onRequestPermission={() => {}}
          />

          {delivery.isDelayed && (
            <InlineAlert
              tone="warning"
              title="Teslimat gecikiyor"
              message="Yoğun trafik nedeniyle tahmini varış süresi uzadı. Kuryen yolda."
              action={{ label: 'Kuryeyi ara', onPress: onCallCourier ?? (() => {}) }}
            />
          )}

          {/* ── Status ─────────────────────────────────────────────── */}
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.lg }}>
            <DeliveryStatusStepper
              status={delivery.status}
              history={delivery.history}
              milestonesOnly
            />
          </Surface>

          {/* ── Courier ────────────────────────────────────────────── */}
          {courier ? (
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Avatar name={courier.fullName} imageUrl={courier.avatarUrl} size="lg" status={courier.status} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Typography variant="bodyStrong" numberOfLines={1}>
                    {courier.fullName}
                  </Typography>
                  <Rating value={courier.rating} count={courier.completedDeliveries} />
                </View>
                <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                  <IconButton
                    icon={MessageSquare}
                    accessibilityLabel="Kuryeye mesaj gönder"
                    variant="surface"
                    size="lg"
                    onPress={onMessageCourier}
                  />
                  <IconButton
                    icon={Phone}
                    accessibilityLabel="Kuryeyi ara"
                    variant="filled"
                    size="lg"
                    onPress={onCallCourier}
                  />
                </View>
              </View>
              <Divider />
              <AddressBlock
                pickup={delivery.pickupAddress}
                dropoff={delivery.dropoffAddress}
                variant="compact"
              />
            </Surface>
          ) : (
            <InlineAlert
              tone="info"
              title="Kurye aranıyor"
              message="Bölgendeki uygun kuryelere görev gönderildi. Atama yapılınca haber vereceğiz."
            />
          )}

          {/* ── Delivery code ──────────────────────────────────────── */}
          <DeliveryCodeCard code={delivery.deliveryCode} />

          {/* ── Full history ───────────────────────────────────────── */}
          <View style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Teslimat geçmişi</Typography>
            <Surface tone="elevated" radius="lg" padding="lg" bordered>
              <DeliveryTimeline delivery={delivery} />
            </Surface>
          </View>

          <Button label="Destek al" variant="tertiary" onPress={onSupport} />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
