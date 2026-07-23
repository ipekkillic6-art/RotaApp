import React, { useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ban, MessageSquarePlus, SlidersHorizontal, UserCog } from 'lucide-react-native';
import {
  ActionSheet,
  AddressCard,
  AppHeader,
  Badge,
  BottomSheet,
  Button,
  CourierCard,
  DeliveryCard,
  DeliveryTimeline,
  MultiSelect,
  ScrollContainer,
  SearchField,
  SegmentedControl,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  StatusBadge,
  Surface,
  TextField,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDateTime } from '../../utils/format';
import type { Courier, Delivery } from '../../types';

/* ── Delivery management ────────────────────────────────────────────────── */

export interface OpsDeliveryListScreenProps {
  deliveries: Delivery[];
  loading?: boolean;
  /** Opens the filter sheet on mount — used by the filter story. */
  filtersOpen?: boolean;
  /** Renders the no-results state. */
  emptyQuery?: string;
  /** Pull-to-refresh. */
  refreshing?: boolean;
  onRefresh?: () => void;
  onOpenDelivery?: (delivery: Delivery) => void;
  onTabChange?: (key: string) => void;
}

export function OpsDeliveryListScreen({
  deliveries,
  loading = false,
  filtersOpen = false,
  emptyQuery,
  refreshing = false,
  onRefresh,
  onOpenDelivery,
  onTabChange,
}: OpsDeliveryListScreenProps) {
  const theme = useTheme();
  const [query, setQuery] = useState(emptyQuery ?? '');
  const [scope, setScope] = useState('all');
  const [showFilters, setShowFilters] = useState(filtersOpen);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const scoped = deliveries.filter((d) => {
    if (scope === 'delayed') return d.isDelayed;
    if (scope === 'unassigned') return !d.courier;
    if (scope === 'failed') return d.status === 'failed';
    return true;
  });

  const list = query
    ? scoped.filter((d) =>
        `${d.trackingNumber} ${d.customerName} ${d.dropoffAddress.district}`
          .toLocaleLowerCase('tr')
          .includes(query.toLocaleLowerCase('tr')),
      )
    : scoped;

  const activeFilterCount = statuses.length + regions.length;

  return (
    <>
      <ScreenScaffold
        header={
          <View>
            <AppHeader
              title="Teslimatlar"
              actions={[
                {
                  icon: SlidersHorizontal,
                  accessibilityLabel: 'Filtrele',
                  onPress: () => setShowFilters(true),
                  badge: activeFilterCount || undefined,
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
                placeholder="Takip no, müşteri veya bölge"
              />
              <SegmentedControl
                variant="underline"
                value={scope}
                onChange={setScope}
                accentColor={theme.colors.role.admin}
                scrollable
                options={[
                  { value: 'all', label: 'Tümü', count: deliveries.length },
                  {
                    value: 'delayed',
                    label: 'Geciken',
                    count: deliveries.filter((d) => d.isDelayed).length,
                  },
                  {
                    value: 'unassigned',
                    label: 'Atanmamış',
                    count: deliveries.filter((d) => !d.courier).length,
                  },
                  {
                    value: 'failed',
                    label: 'Başarısız',
                    count: deliveries.filter((d) => d.status === 'failed').length,
                  },
                ]}
              />
            </View>
          </View>
        }
        role="admin"
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
                variant="admin"
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
              <StateView
                {...(query ? STATE_PRESETS.noSearchResults : STATE_PRESETS.noFilterResults)}
                secondaryAction={{
                  label: 'Filtreleri temizle',
                  onPress: () => {
                    setQuery('');
                    setStatuses([]);
                    setRegions([]);
                    setScope('all');
                  },
                }}
              />
            }
          />
        )}
      </ScreenScaffold>

      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtrele"
        showCloseButton
        footer={
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Temizle"
                variant="tertiary"
                onPress={() => {
                  setStatuses([]);
                  setRegions([]);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Uygula" onPress={() => setShowFilters(false)} />
            </View>
          </View>
        }
      >
        <View style={{ gap: theme.spacing.lg }}>
          <MultiSelect
            label="Durum"
            inline
            values={statuses}
            onChange={setStatuses}
            options={[
              { value: 'pending', label: 'Bekliyor' },
              { value: 'assigning', label: 'Kurye aranıyor' },
              { value: 'on_the_way', label: 'Yolda' },
              { value: 'delivered', label: 'Teslim edildi' },
              { value: 'failed', label: 'Teslim edilemedi' },
            ]}
          />
          <MultiSelect
            label="Bölge"
            inline
            values={regions}
            onChange={setRegions}
            options={[
              { value: 'kadikoy', label: 'Kadıköy', hint: '64 teslimat' },
              { value: 'sisli', label: 'Şişli', hint: '52 teslimat' },
              { value: 'besiktas', label: 'Beşiktaş', hint: '41 teslimat' },
              { value: 'tuzla', label: 'Tuzla', hint: '24 teslimat' },
            ]}
          />
        </View>
      </BottomSheet>
    </>
  );
}

/* ── Courier assignment ─────────────────────────────────────────────────── */

export interface CourierAssignmentScreenProps {
  delivery: Delivery;
  candidates: Courier[];
  assigning?: boolean;
  /** No courier is available in the region. */
  empty?: boolean;
  onBack?: () => void;
  onAssign?: (courier: Courier) => void;
}

/**
 * Courier assignment.
 *
 * Candidates are ordered by distance, and each card leads with distance, ETA
 * and current load — the three facts the decision actually turns on. Rating is
 * present but deliberately not the headline: the nearest good courier beats
 * the best distant one.
 */
export function CourierAssignmentScreen({
  delivery,
  candidates,
  assigning = false,
  empty = false,
  onBack,
  onAssign,
}: CourierAssignmentScreenProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<Courier | undefined>();

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Kurye ata"
          subtitle={delivery.trackingNumber}
          onBack={onBack}
          bordered
        />
      }
      tone="sunken"
      footer={
        <Button
          label={selected ? `${selected.fullName} kuryesini ata` : 'Bir kurye seç'}
          onPress={() => selected && onAssign?.(selected)}
          disabled={!selected}
          loading={assigning}
        />
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.sm }}>
            <StatusBadge status={delivery.status} />
            <AddressCard address={delivery.pickupAddress} variant="compact" />
          </Surface>

          {empty || candidates.length === 0 ? (
            <StateView
              icon={STATE_PRESETS.noActiveTasks.icon}
              title="Bu bölgede müsait kurye yok"
              description="Yakındaki bölgelerden kurye çağırabilir veya teslimatı sıraya alabilirsin."
              tone="warning"
              primaryAction={{ label: 'Komşu bölgelerden ara', onPress: () => {} }}
              secondaryAction={{ label: 'Sıraya al', onPress: () => {} }}
            />
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">
                Uygun kuryeler ({candidates.length})
              </Typography>
              <Typography variant="micro" tone="muted">
                Mesafeye göre sıralandı.
              </Typography>
              {candidates.map((courier) => (
                <CourierCard
                  key={courier.id}
                  courier={courier}
                  variant="assignment"
                  selected={selected?.id === courier.id}
                  onPress={() => setSelected(courier)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/* ── Ops delivery detail ────────────────────────────────────────────────── */

export interface OpsDeliveryDetailScreenProps {
  delivery: Delivery;
  onBack?: () => void;
  onReassign?: () => void;
  onCancel?: () => void;
}

export function OpsDeliveryDetailScreen({
  delivery,
  onBack,
  onReassign,
  onCancel,
}: OpsDeliveryDetailScreenProps) {
  const theme = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [note, setNote] = useState('');

  return (
    <>
      <ScreenScaffold
        header={
          <AppHeader
            title="Teslimat yönetimi"
            subtitle={delivery.trackingNumber}
            onBack={onBack}
            actions={[
              {
                icon: UserCog,
                accessibilityLabel: 'Teslimat işlemleri',
                onPress: () => setShowActions(true),
              },
            ]}
            bordered
          />
        }
        tone="sunken"
        footer={
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="Kurye değiştir" variant="secondary" onPress={onReassign} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="İptal et" variant="danger" onPress={onCancel} />
            </View>
          </View>
        }
      >
        <ScrollContainer>
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                <StatusBadge status={delivery.status} size="md" delayed={delivery.isDelayed} />
                {!delivery.courier && <Badge label="Atanmamış" tone="warning" size="md" />}
              </View>
              <Typography variant="micro" tone="muted" tabular>
                Oluşturuldu · {formatDateTime(delivery.createdAt)}
              </Typography>
            </Surface>

            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: 4 }}>
              <Typography variant="micro" tone="muted" overline>
                Müşteri
              </Typography>
              <Typography variant="bodyStrong">{delivery.customerName}</Typography>
              <Typography variant="micro" tone="secondary">
                {delivery.pickupAddress.contactPhone ?? '—'}
              </Typography>
            </Surface>

            <AddressCard address={delivery.pickupAddress} variant="pickup" />
            <AddressCard address={delivery.dropoffAddress} variant="dropoff" />

            <View style={{ gap: theme.spacing.sm }}>
              <Typography variant="h3">Kurye</Typography>
              {delivery.courier ? (
                <CourierCard courier={delivery.courier} variant="assignment" />
              ) : (
                <StateView
                  icon={STATE_PRESETS.noActiveTasks.icon}
                  title="Kurye atanmadı"
                  description="Bu teslimat hâlâ atama bekliyor."
                  tone="warning"
                  size="compact"
                  primaryAction={{ label: 'Kurye ata', onPress: onReassign ?? (() => {}) }}
                />
              )}
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Typography variant="h3">Durum geçmişi</Typography>
              <Surface tone="elevated" radius="lg" padding="lg" bordered>
                <DeliveryTimeline delivery={delivery} />
              </Surface>
            </View>

            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">Operasyon notu</Typography>
              <TextField
                placeholder="Bu teslimatla ilgili not ekle"
                value={note}
                onChangeText={setNote}
                multiline
                rows={3}
                maxLength={300}
                showCounter
              />
              <Button
                label="Notu kaydet"
                variant="secondary"
                icon={MessageSquarePlus}
                onPress={() => setNote('')}
                disabled={note.trim().length === 0}
              />
            </Surface>
          </View>
        </ScrollContainer>
      </ScreenScaffold>

      <ActionSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        title="Teslimat işlemleri"
        actions={[
          { key: 'reassign', label: 'Kurye değiştir', icon: UserCog, onPress: onReassign ?? (() => {}) },
          { key: 'note', label: 'Operasyon notu ekle', icon: MessageSquarePlus, onPress: () => {} },
          {
            key: 'cancel',
            label: 'Teslimatı iptal et',
            description: 'Müşteriye iade süreci başlatılır',
            icon: Ban,
            destructive: true,
            onPress: onCancel ?? (() => {}),
          },
        ]}
      />
    </>
  );
}
