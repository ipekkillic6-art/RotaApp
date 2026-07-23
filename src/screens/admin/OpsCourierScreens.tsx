import React, { useState } from 'react';
import { View } from 'react-native';
import { CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react-native';
import {
  AppHeader,
  CourierCard,
  Divider,
  MetricCard,
  ProgressBar,
  ResponsiveGrid,
  ScrollContainer,
  SearchField,
  SegmentedControl,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDuration, formatPercent } from '../../utils/format';
import type { Courier, CourierStatus, OpsMetrics } from '../../types';

/* ── Courier list ───────────────────────────────────────────────────────── */

export interface OpsCourierListScreenProps {
  couriers: Courier[];
  filter?: CourierStatus | 'all';
  loading?: boolean;
  onOpenCourier?: (courier: Courier) => void;
  onTabChange?: (key: string) => void;
}

export function OpsCourierListScreen({
  couriers,
  filter: initialFilter = 'all',
  loading = false,
  onOpenCourier,
  onTabChange,
}: OpsCourierListScreenProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<CourierStatus | 'all'>(initialFilter);
  const [query, setQuery] = useState('');

  const byStatus =
    filter === 'all' ? couriers : couriers.filter((c) => c.status === filter);
  const list = query
    ? byStatus.filter((c) =>
        c.fullName.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')),
      )
    : byStatus;

  const countFor = (status: CourierStatus | 'all') =>
    status === 'all' ? couriers.length : couriers.filter((c) => c.status === status).length;

  return (
    <ScreenScaffold
      header={
        <View>
          <AppHeader title="Kuryeler" />
          <View
            style={{
              paddingHorizontal: theme.layout.screenPaddingX,
              paddingBottom: theme.spacing.sm,
              gap: theme.spacing.md,
            }}
          >
            <SearchField value={query} onChangeText={setQuery} placeholder="Kurye ara" />
            <SegmentedControl
              variant="underline"
              value={filter}
              onChange={setFilter}
              accentColor={theme.colors.role.admin}
              scrollable
              options={[
                { value: 'all', label: 'Tümü', count: countFor('all') },
                { value: 'available', label: 'Aktif', count: countFor('available') },
                { value: 'busy', label: 'Meşgul', count: countFor('busy') },
                { value: 'offline', label: 'Çevrimdışı', count: countFor('offline') },
                { value: 'suspended', label: 'Askıda', count: countFor('suspended') },
              ]}
            />
          </View>
        </View>
      }
      role="admin"
      activeTab="couriers"
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.layout.listGap, paddingTop: theme.spacing.md }}>
          {loading ? (
            <SkeletonList count={4} />
          ) : list.length === 0 ? (
            <StateView
              {...(query ? STATE_PRESETS.noSearchResults : STATE_PRESETS.noFilterResults)}
              secondaryAction={{
                label: 'Filtreleri temizle',
                onPress: () => {
                  setQuery('');
                  setFilter('all');
                },
              }}
            />
          ) : (
            list.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                variant="assignment"
                onPress={() => onOpenCourier?.(courier)}
              />
            ))
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/* ── Analytics ──────────────────────────────────────────────────────────── */

export interface OpsAnalyticsScreenProps {
  metrics: OpsMetrics;
  regions: Array<{ region: string; deliveries: number; successRate: number }>;
  cancellations: Array<{ reason: string; count: number }>;
  topCouriers: Courier[];
  onBack?: () => void;
}

/**
 * Operations analytics.
 *
 * All charts are composed from `ProgressBar` and layout primitives rather than
 * a charting library — at this fidelity the point is to prove the information
 * architecture, and a chart dependency would be premature weight in an RN app.
 * The bars are honest: each one is the real ratio from the fixture.
 */
export function OpsAnalyticsScreen({
  metrics,
  regions,
  cancellations,
  topCouriers,
  onBack,
}: OpsAnalyticsScreenProps) {
  const theme = useTheme();
  const [period, setPeriod] = useState('week');
  const maxCancellation = Math.max(...cancellations.map((c) => c.count), 1);

  return (
    <ScreenScaffold
      header={<AppHeader title="İstatistikler" onBack={onBack} bordered />}
      tone="sunken"
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            accentColor={theme.colors.role.admin}
            options={[
              { value: 'day', label: 'Bugün' },
              { value: 'week', label: 'Bu hafta' },
              { value: 'month', label: 'Bu ay' },
            ]}
          />

          <ResponsiveGrid minColumnWidth={150}>
            <MetricCard
              label="Toplam teslimat"
              value={String(metrics.totalToday)}
              icon={TrendingUp}
              tone="brand"
              caption="dünden %8 fazla"
              trend="up"
            />
            <MetricCard
              label="Başarı oranı"
              value={formatPercent(metrics.successRate)}
              icon={CheckCircle2}
              tone="success"
            />
            <MetricCard
              label="Ortalama süre"
              value={formatDuration(metrics.averageDeliveryMinutes)}
              icon={Clock}
            />
            <MetricCard
              label="Başarısız"
              value={String(metrics.failedDeliveries)}
              icon={XCircle}
              tone="error"
              caption="dünden 1 az"
              trend="down"
              trendPositiveIsGood={false}
            />
          </ResponsiveGrid>

          {/* ── Regions ────────────────────────────────────────────── */}
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Bölgesel dağılım</Typography>
            {regions.map((region) => (
              <View key={region.region} style={{ gap: theme.spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Typography variant="bodySm">{region.region}</Typography>
                  <Typography variant="micro" tone="muted" tabular>
                    {region.deliveries} · {formatPercent(region.successRate, 0)}
                  </Typography>
                </View>
                <ProgressBar
                  value={region.successRate}
                  tone={region.successRate < 0.9 ? 'warning' : 'success'}
                />
              </View>
            ))}
          </Surface>

          {/* ── Cancellation reasons ───────────────────────────────── */}
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">İptal nedenleri</Typography>
            {cancellations.map((item, i) => (
              <React.Fragment key={item.reason}>
                {i > 0 && <Divider />}
                <View style={{ gap: theme.spacing.xs, paddingVertical: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Typography variant="bodySm" style={{ flex: 1 }} numberOfLines={1}>
                      {item.reason}
                    </Typography>
                    <Typography variant="caption" tone="secondary" tabular>
                      {item.count}
                    </Typography>
                  </View>
                  <ProgressBar value={item.count / maxCancellation} tone="error" />
                </View>
              </React.Fragment>
            ))}
          </Surface>

          {/* ── Top couriers ───────────────────────────────────────── */}
          <View style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Kurye performansı</Typography>
            {topCouriers.map((courier) => (
              <CourierCard key={courier.id} courier={courier} variant="compact" />
            ))}
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
