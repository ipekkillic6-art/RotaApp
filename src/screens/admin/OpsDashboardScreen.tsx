import React from 'react';
import { View } from 'react-native';
import {
  Bell,
  CheckCircle2,
  Clock,
  Package,
  TriangleAlert,
  Truck,
  Users,
  XCircle,
} from 'lucide-react-native';
import {
  AppHeader,
  DeliveryCard,
  InlineAlert,
  MetricCard,
  ResponsiveGrid,
  ScrollContainer,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { SectionTitle } from '../customer/CustomerHomeScreen';
import { formatDuration, formatPercent } from '../../utils/format';
import type { Delivery, OpsMetrics } from '../../types';

export interface OpsDashboardScreenProps {
  metrics: OpsMetrics;
  /** Deliveries that need a human decision right now. */
  attentionQueue: Delivery[];
  loading?: boolean;
  unreadAlerts?: number;
  onOpenDelivery?: (delivery: Delivery) => void;
  onAssignCourier?: (delivery: Delivery) => void;
  onTabChange?: (key: string) => void;
}

/**
 * Operations dashboard.
 *
 * Ordered by what needs a decision, not by what looks impressive: delayed and
 * failed sit first among the metrics, and the list below is an action queue
 * rather than "all deliveries". A dashboard that shows healthy totals at the
 * top and buries the four late packages is a dashboard nobody acts on.
 *
 * The metric grid becomes two columns on a phone and four on a tablet through
 * `ResponsiveGrid` — no separate tablet layout.
 */
export function OpsDashboardScreen({
  metrics,
  attentionQueue,
  loading = false,
  unreadAlerts,
  onOpenDelivery,
  onAssignCourier,
  onTabChange,
}: OpsDashboardScreenProps) {
  const theme = useTheme();
  const needsAttention = metrics.delayedDeliveries + metrics.failedDeliveries;
  const isQuiet = metrics.totalToday === 0;

  return (
    <ScreenScaffold
      header={
        <AppHeader
          variant="large"
          title="Operasyon"
          subtitle={`Bugün ${metrics.totalToday} teslimat · ${formatPercent(metrics.successRate)} başarı`}
          actions={[
            {
              icon: Bell,
              accessibilityLabel: 'Uyarılar',
              onPress: () => {},
              badge: unreadAlerts,
            },
          ]}
        />
      }
      role="admin"
      activeTab="dashboard"
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.layout.sectionGap, paddingTop: theme.spacing.sm }}>
          {loading ? (
            <SkeletonList count={3} />
          ) : isQuiet ? (
            <StateView
              icon={Package}
              title="Bugün henüz teslimat yok"
              description="Gün başladığında canlı sayaçlar burada güncellenecek."
              fullHeight
            />
          ) : (
            <>
              {needsAttention > 0 && (
                <InlineAlert
                  tone="warning"
                  title={`${needsAttention} teslimat müdahale bekliyor`}
                  message={`${metrics.delayedDeliveries} gecikmiş, ${metrics.failedDeliveries} başarısız teslimat var.`}
                  action={{ label: 'Kuyruğa git', onPress: () => {} }}
                />
              )}

              {/* ── Attention-first metrics ────────────────────────── */}
              <ResponsiveGrid minColumnWidth={150}>
                <MetricCard
                  label="Geciken"
                  value={String(metrics.delayedDeliveries)}
                  icon={Clock}
                  tone={metrics.delayedDeliveries > 0 ? 'warning' : 'neutral'}
                />
                <MetricCard
                  label="Başarısız"
                  value={String(metrics.failedDeliveries)}
                  icon={XCircle}
                  tone={metrics.failedDeliveries > 0 ? 'error' : 'neutral'}
                />
                <MetricCard
                  label="Bekleyen"
                  value={String(metrics.pendingDeliveries)}
                  icon={Package}
                  tone="neutral"
                />
                <MetricCard
                  label="Aktif teslimat"
                  value={String(metrics.activeDeliveries)}
                  icon={Truck}
                  tone="brand"
                />
                <MetricCard
                  label="Müsait kurye"
                  value={String(metrics.availableCouriers)}
                  icon={Users}
                  tone={metrics.availableCouriers < 3 ? 'warning' : 'success'}
                />
                <MetricCard
                  label="Ortalama süre"
                  value={formatDuration(metrics.averageDeliveryMinutes)}
                  icon={CheckCircle2}
                  tone="neutral"
                />
              </ResponsiveGrid>

              {/* ── Action queue ───────────────────────────────────── */}
              <View style={{ gap: theme.spacing.md }}>
                <SectionTitle title="Müdahale kuyruğu" action="Tümü" onPress={() => {}} />
                {attentionQueue.length === 0 ? (
                  <StateView
                    icon={CheckCircle2}
                    title="Kuyruk temiz"
                    description="Şu anda müdahale gerektiren teslimat yok."
                    tone="brand"
                    size="compact"
                  />
                ) : (
                  attentionQueue.map((delivery, i) => (
                    <DeliveryCard
                      key={delivery.id + i}
                      delivery={delivery}
                      variant="admin"
                      onPress={() => onOpenDelivery?.(delivery)}
                      primaryAction={
                        delivery.courier
                          ? undefined
                          : {
                              label: 'Kurye ata',
                              onPress: () => onAssignCourier?.(delivery),
                            }
                      }
                      secondaryAction={
                        delivery.status === 'failed'
                          ? { label: 'Yeniden dene', onPress: () => {} }
                          : undefined
                      }
                    />
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
