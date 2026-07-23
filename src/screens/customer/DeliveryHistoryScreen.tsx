import React, { useState } from 'react';
import { View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import {
  AppHeader,
  DeliveryCard,
  ScrollContainer,
  SearchField,
  SegmentedControl,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { Delivery } from '../../types';

export type HistoryFilter = 'all' | 'completed' | 'cancelled' | 'failed';

const FILTERS: Array<{ value: HistoryFilter; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'completed', label: 'Tamamlanan' },
  { value: 'cancelled', label: 'İptal' },
  { value: 'failed', label: 'Başarısız' },
];

export interface DeliveryHistoryScreenProps {
  deliveries: Delivery[];
  filter?: HistoryFilter;
  loading?: boolean;
  errorText?: string;
  onOpenDelivery?: (delivery: Delivery) => void;
  onOpenFilters?: () => void;
  onTabChange?: (key: string) => void;
}

/** Past deliveries with filtering and search. */
export function DeliveryHistoryScreen({
  deliveries,
  filter: initialFilter = 'all',
  loading = false,
  errorText,
  onOpenDelivery,
  onOpenFilters,
  onTabChange,
}: DeliveryHistoryScreenProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<HistoryFilter>(initialFilter);
  const [query, setQuery] = useState('');

  const byFilter = deliveries.filter((d) => {
    if (filter === 'completed') return d.status === 'delivered';
    if (filter === 'cancelled') return d.status === 'cancelled';
    if (filter === 'failed') return d.status === 'failed';
    return true;
  });

  const list = query
    ? byFilter.filter((d) =>
        `${d.trackingNumber} ${d.dropoffAddress.district} ${d.dropoffAddress.title}`
          .toLocaleLowerCase('tr')
          .includes(query.toLocaleLowerCase('tr')),
      )
    : byFilter;

  const counts = FILTERS.map((f) => ({
    ...f,
    count: deliveries.filter((d) =>
      f.value === 'completed'
        ? d.status === 'delivered'
        : f.value === 'cancelled'
          ? d.status === 'cancelled'
          : f.value === 'failed'
            ? d.status === 'failed'
            : true,
    ).length,
  }));

  return (
    <ScreenScaffold
      header={
        <View>
          <AppHeader
            title="Teslimatlarım"
            actions={[
              {
                icon: SlidersHorizontal,
                accessibilityLabel: 'Filtrele',
                onPress: onOpenFilters ?? (() => {}),
              },
            ]}
          />
          <View
            style={{
              paddingHorizontal: theme.layout.screenPaddingX,
              paddingBottom: theme.spacing.sm,
              gap: theme.spacing.md,
            }}
          >
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Takip numarası veya adres ara"
            />
            <SegmentedControl
              variant="underline"
              value={filter}
              onChange={setFilter}
              options={counts}
              scrollable
            />
          </View>
        </View>
      }
      role="customer"
      activeTab="deliveries"
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.layout.listGap, paddingTop: theme.spacing.md }}>
          {errorText ? (
            <StateView
              {...STATE_PRESETS.serverError}
              description={errorText}
              primaryAction={{ label: 'Tekrar dene', onPress: () => {} }}
            />
          ) : loading ? (
            <SkeletonList count={4} />
          ) : list.length === 0 ? (
            <StateView
              {...(query ? STATE_PRESETS.noSearchResults : STATE_PRESETS.noHistory)}
              secondaryAction={
                query ? { label: 'Aramayı temizle', onPress: () => setQuery('') } : undefined
              }
            />
          ) : (
            list.map((delivery, i) => (
              <DeliveryCard
                key={delivery.id + i}
                delivery={delivery}
                variant="customer"
                onPress={() => onOpenDelivery?.(delivery)}
              />
            ))
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
