import React, { useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SlidersHorizontal } from 'lucide-react-native';
import {
  AppHeader,
  BottomSheet,
  Button,
  DeliveryCard,
  ScrollContainer,
  SearchField,
  SegmentedControl,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  Typography,
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

type SortOrder = 'newest' | 'oldest';
const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: 'newest', label: 'Önce yeni' },
  { value: 'oldest', label: 'Önce eski' },
];

export interface DeliveryHistoryScreenProps {
  deliveries: Delivery[];
  filter?: HistoryFilter;
  loading?: boolean;
  errorText?: string;
  /** Pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
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
  refreshing = false,
  onRefresh,
  onOpenDelivery,
  onOpenFilters,
  onTabChange,
}: DeliveryHistoryScreenProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<HistoryFilter>(initialFilter);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [sheetOpen, setSheetOpen] = useState(false);

  const byFilter = deliveries.filter((d) => {
    if (filter === 'completed') return d.status === 'delivered';
    if (filter === 'cancelled') return d.status === 'cancelled';
    if (filter === 'failed') return d.status === 'failed';
    return true;
  });

  const searched = query
    ? byFilter.filter((d) =>
        `${d.trackingNumber} ${d.dropoffAddress.district} ${d.dropoffAddress.title}`
          .toLocaleLowerCase('tr')
          .includes(query.toLocaleLowerCase('tr')),
      )
    : byFilter;

  const list = [...searched].sort((a, b) =>
    sort === 'newest'
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt),
  );

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
    <>
    <ScreenScaffold
      header={
        <View>
          <AppHeader
            title="Teslimatlarım"
            actions={[
              {
                icon: SlidersHorizontal,
                accessibilityLabel: 'Filtrele',
                onPress: onOpenFilters ?? (() => setSheetOpen(true)),
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
      {loading ? (
        <ScrollContainer bottomInset={theme.chrome.tabBar}>
          <View style={{ paddingTop: theme.spacing.md }}>
            <SkeletonList count={4} />
          </View>
        </ScrollContainer>
      ) : (
        <FlashList
          data={list}
          keyExtractor={(item, i) => item.id + i}
          renderItem={({ item }) => (
            <DeliveryCard
              delivery={item}
              variant="customer"
              onPress={() => onOpenDelivery?.(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: theme.layout.listGap }} />}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.screenPaddingX,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.chrome.tabBar,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            errorText ? (
              <StateView
                {...STATE_PRESETS.serverError}
                description={errorText}
                primaryAction={onRefresh ? { label: 'Tekrar dene', onPress: onRefresh } : undefined}
              />
            ) : (
              <StateView
                {...(query ? STATE_PRESETS.noSearchResults : STATE_PRESETS.noHistory)}
                secondaryAction={
                  query ? { label: 'Aramayı temizle', onPress: () => setQuery('') } : undefined
                }
              />
            )
          }
        />
      )}
    </ScreenScaffold>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtrele"
        description="Teslimat geçmişini sırala ve süz"
        footer={<Button label="Uygula" onPress={() => setSheetOpen(false)} />}
      >
        <View style={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.sm }}>
            <Typography variant="caption" tone="secondary">
              Sıralama
            </Typography>
            <SegmentedControl value={sort} onChange={setSort} options={SORT_OPTIONS} />
          </View>
          <View style={{ gap: theme.spacing.sm }}>
            <Typography variant="caption" tone="secondary">
              Durum
            </Typography>
            <SegmentedControl value={filter} onChange={setFilter} options={FILTERS} scrollable />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
