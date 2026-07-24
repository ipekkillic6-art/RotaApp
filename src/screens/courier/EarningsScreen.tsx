import React, { useState } from 'react';
import { View } from 'react-native';
import { Award, Clock, Percent, Star, TrendingUp, XCircle } from 'lucide-react-native';
import {
  AppHeader,
  Avatar,
  Divider,
  EarningsCard,
  MetricCard,
  ProgressBar,
  Rating,
  ResponsiveGrid,
  ScrollContainer,
  SegmentedControl,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDuration, formatPercent, formatPrice } from '../../utils/format';
import type {
  Courier,
  CourierPerformance,
  CustomerReview,
  EarningsPeriod,
} from '../../types';

export interface EarningsScreenProps {
  periods: EarningsPeriod[];
  /** Daily bars for the mock chart. */
  byDay: Array<{ label: string; amount: number }>;
  pendingPayout: number;
  totalEarnings: number;
  onOpenPerformance?: () => void;
  onTabChange?: (key: string) => void;
}

/**
 * Earnings.
 *
 * The chart is a hand-drawn bar row rather than a charting library: at this
 * stage it communicates shape and layout, and adding a chart dependency to
 * render seven bars would be an unjustified weight in a React Native bundle.
 */
export function EarningsScreen({
  periods,
  byDay,
  pendingPayout,
  totalEarnings,
  onOpenPerformance,
  onTabChange,
}: EarningsScreenProps) {
  const theme = useTheme();
  const [index, setIndex] = useState('1');
  const period = periods[Number(index)] ?? periods[0];
  const maxBar = Math.max(...byDay.map((d) => d.amount), 1);

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Kazançlarım"
          actions={[
            {
              icon: Award,
              accessibilityLabel: 'Performansım',
              onPress: onOpenPerformance ?? (() => {}),
            },
          ]}
        />
      }
      role="courier"
      activeTab="earnings"
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <SegmentedControl
            value={index}
            onChange={setIndex}
            accentColor={theme.colors.role.courier}
            options={periods.map((p, i) => ({ value: String(i), label: p.label }))}
          />

          <EarningsCard period={period} pendingPayout={pendingPayout} />

          {/* ── Bar chart mock ─────────────────────────────────────── */}
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Günlük dağılım</Typography>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: 120,
                gap: theme.spacing.xs,
              }}
              accessibilityLabel="Haftalık kazanç grafiği"
            >
              {byDay.map((day) => (
                <View key={day.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <Typography variant="tiny" tone="muted" tabular>
                    {day.amount > 0 ? Math.round(day.amount) : ''}
                  </Typography>
                  <View
                    style={{
                      width: '100%',
                      height: Math.max(4, (day.amount / maxBar) * 80),
                      borderRadius: theme.radius.xs,
                      backgroundColor:
                        day.amount === 0
                          ? theme.colors.border.subtle
                          : theme.colors.role.courier,
                    }}
                  />
                  <Typography variant="tiny" tone="muted">
                    {day.label}
                  </Typography>
                </View>
              ))}
            </View>
          </Surface>

          <ResponsiveGrid minColumnWidth={150}>
            <MetricCard
              label="Toplam kazanç"
              value={formatPrice(totalEarnings, { compact: true })}
              icon={TrendingUp}
              tone="success"
              variant="compact"
            />
            <MetricCard
              label="Teslimat başına ortalama"
              value={formatPrice(period.averagePerDelivery, { compact: true })}
              icon={Percent}
              variant="compact"
            />
          </ResponsiveGrid>

          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Kazanç geçmişi</Typography>
            {periods.map((p, i) => (
              <React.Fragment key={p.label}>
                {i > 0 && <Divider />}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <View style={{ gap: 1 }}>
                    <Typography variant="bodySm">{p.label}</Typography>
                    <Typography variant="micro" tone="muted">
                      {p.deliveries} teslimat
                    </Typography>
                  </View>
                  <Typography variant="bodyStrong" tabular>
                    {formatPrice(p.amount, { compact: true })}
                  </Typography>
                </View>
              </React.Fragment>
            ))}
          </Surface>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

export interface CourierPerformanceScreenProps {
  courier: Courier;
  performance: CourierPerformance;
  reviews: CustomerReview[];
  onBack?: () => void;
}

export function CourierPerformanceScreen({
  courier,
  performance,
  reviews,
  onBack,
}: CourierPerformanceScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Performansım" onBack={onBack} bordered />}
      tone="sunken"
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <Surface
            tone="elevated"
            radius="xl"
            padding="xl"
            bordered
            style={{ alignItems: 'center', gap: theme.spacing.sm }}
          >
            <Avatar name={courier.fullName} imageUrl={courier.avatarUrl} size="xl" />
            <Typography variant="h2">{courier.fullName}</Typography>
            <Rating value={performance.rating} count={courier.completedDeliveries} size="md" />
          </Surface>

          <ResponsiveGrid minColumnWidth={150}>
            <MetricCard
              label="Tamamlama oranı"
              value={formatPercent(performance.completionRate)}
              icon={Star}
              tone="success"
              variant="compact"
            />
            <MetricCard
              label="Ortalama süre"
              value={formatDuration(performance.averageDeliveryMinutes)}
              icon={Clock}
              variant="compact"
            />
            <MetricCard
              label="Zamanında teslim"
              value={formatPercent(performance.onTimeRate)}
              icon={TrendingUp}
              tone="brand"
              variant="compact"
            />
            <MetricCard
              label="İptal oranı"
              value={formatPercent(performance.cancellationRate)}
              icon={XCircle}
              tone="warning"
              variant="compact"
            />
          </ResponsiveGrid>

          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Hedeflerin</Typography>
            <ProgressBar
              value={performance.completionRate}
              label="Tamamlama oranı (hedef %95)"
              tone="success"
              showValue
            />
            <ProgressBar
              value={performance.onTimeRate}
              label="Zamanında teslim (hedef %90)"
              showValue
            />
          </Surface>

          <View style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Müşteri yorumları</Typography>
            {reviews.map((review) => (
              <Surface
                key={review.id}
                tone="elevated"
                radius="lg"
                padding="lg"
                bordered
                style={{ gap: theme.spacing.sm }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="bodyStrong">{review.customerName}</Typography>
                  <Rating value={review.rating} />
                </View>
                {review.comment && (
                  <Typography variant="bodySm" tone="secondary">
                    {review.comment}
                  </Typography>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {review.tags.map((tag) => (
                    <Typography key={tag} variant="micro" tone="accent">
                      · {tag}
                    </Typography>
                  ))}
                </View>
              </Surface>
            ))}
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
