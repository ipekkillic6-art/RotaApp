import React from 'react';
import { View } from 'react-native';
import { LifeBuoy, RefreshCw, Star } from 'lucide-react-native';
import {
  AddressCard,
  AppHeader,
  Button,
  CourierCard,
  DeliveryTimeline,
  InlineAlert,
  PackageInfoCard,
  PriceSummary,
  ScrollContainer,
  StatusBadge,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDateTime } from '../../utils/format';
import type { Delivery } from '../../types';

export interface DeliveryDetailScreenProps {
  delivery: Delivery;
  onBack?: () => void;
  onReorder?: () => void;
  onRate?: () => void;
  onSupport?: () => void;
}

/** Everything known about one delivery, after the fact. */
export function DeliveryDetailScreen({
  delivery,
  onBack,
  onReorder,
  onRate,
  onSupport,
}: DeliveryDetailScreenProps) {
  const theme = useTheme();
  const canRate = delivery.status === 'delivered' && !delivery.rating;

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Teslimat detayı"
          subtitle={delivery.trackingNumber}
          onBack={onBack}
          actions={[
            { icon: LifeBuoy, accessibilityLabel: 'Destek al', onPress: onSupport ?? (() => {}) },
          ]}
          bordered
        />
      }
      tone="sunken"
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          {canRate && <Button label="Teslimatı puanla" icon={Star} onPress={onRate} />}
          <Button
            label="Tekrar sipariş ver"
            icon={RefreshCw}
            variant={canRate ? 'tertiary' : 'primary'}
            onPress={onReorder}
          />
        </View>
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.sm }}>
            <StatusBadge status={delivery.status} size="md" delayed={delivery.isDelayed} />
            <Typography variant="micro" tone="muted" tabular>
              Oluşturuldu · {formatDateTime(delivery.createdAt)}
            </Typography>
            {delivery.deliveredAt && (
              <Typography variant="micro" tone="muted" tabular>
                Teslim edildi · {formatDateTime(delivery.deliveredAt)}
              </Typography>
            )}
          </Surface>

          {delivery.status === 'failed' && delivery.failureNote && (
            <InlineAlert
              tone="error"
              title="Teslim edilemedi"
              message={delivery.failureNote}
              action={{ label: 'Yeniden gönder', onPress: onReorder ?? (() => {}) }}
            />
          )}

          <AddressCard address={delivery.pickupAddress} variant="pickup" />
          <AddressCard address={delivery.dropoffAddress} variant="dropoff" />

          <PackageInfoCard
            type={delivery.packageType}
            description={delivery.packageDescription}
          />

          {delivery.courier && (
            <View style={{ gap: theme.spacing.sm }}>
              <Typography variant="h3">Kurye</Typography>
              <CourierCard courier={delivery.courier} />
            </View>
          )}

          <View style={{ gap: theme.spacing.sm }}>
            <Typography variant="h3">Ücret</Typography>
            <PriceSummary price={delivery.price} distanceKm={delivery.distanceKm} />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Typography variant="h3">Durum geçmişi</Typography>
            <Surface tone="elevated" radius="lg" padding="lg" bordered>
              <DeliveryTimeline delivery={delivery} />
            </Surface>
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
