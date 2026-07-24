import React from 'react';
import { View } from 'react-native';
import { Bell, CheckCircle2, Package, Star, Target, Timer } from 'lucide-react-native';
import {
  AppHeader,
  Avatar,
  DeliveryCard,
  EarningsCard,
  Icon,
  InlineAlert,
  MetricCard,
  ProgressBar,
  ResponsiveGrid,
  ScrollContainer,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  Surface,
  Switch,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { SectionTitle } from '../customer/CustomerHomeScreen';
import type { Courier, Delivery, EarningsPeriod } from '../../types';

export interface CourierHomeScreenProps {
  courier: Courier;
  online: boolean;
  onToggleOnline?: (online: boolean) => void;
  earnings: EarningsPeriod;
  /** The task in progress, if any. */
  activeTask?: Delivery;
  /** Offers waiting for a decision. */
  newTasks: Delivery[];
  /** Completed today / daily target. */
  dailyGoal?: { done: number; target: number };
  loading?: boolean;
  offline?: boolean;
  onOpenTask?: (delivery: Delivery) => void;
  onAcceptTask?: (delivery: Delivery) => void;
  onOpenNotifications?: () => void;
  onTabChange?: (key: string) => void;
}

/**
 * Courier home.
 *
 * The online switch is the first thing on the screen and the largest control
 * on it — everything else in the courier product is downstream of that one
 * state, and a courier who thinks they are online when they are not loses
 * money.
 */
export function CourierHomeScreen({
  courier,
  online,
  onToggleOnline,
  earnings,
  activeTask,
  newTasks,
  dailyGoal,
  loading = false,
  offline = false,
  onOpenTask,
  onAcceptTask,
  onOpenNotifications,
  onTabChange,
}: CourierHomeScreenProps) {
  const theme = useTheme();
  const goalComplete = dailyGoal ? dailyGoal.done >= dailyGoal.target : false;

  return (
    <ScreenScaffold
      header={
        <AppHeader
          leading={<Avatar name={courier.fullName} imageUrl={courier.avatarUrl} size="sm" />}
          center={
            <View style={{ paddingLeft: theme.spacing.xs }}>
              <Typography variant="micro" tone="muted">
                Kurye
              </Typography>
              <Typography variant="bodyStrong" numberOfLines={1}>
                {courier.fullName}
              </Typography>
            </View>
          }
          actions={[
            {
              icon: Bell,
              accessibilityLabel: 'Bildirimler',
              onPress: onOpenNotifications ?? (() => {}),
              badge: true,
            },
          ]}
        />
      }
      role="courier"
      activeTab="home"
      onTabChange={onTabChange}
      offline={offline}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.layout.sectionGap, paddingTop: theme.spacing.md }}>
          {/* ── Online switch ──────────────────────────────────────── */}
          <Surface
            tone={online ? 'brand' : 'elevated'}
            radius="xl"
            padding="xl"
            bordered
            borderColor={online ? theme.colors.role.courier : undefined}
          >
            <Switch
              label={online ? 'Çevrimiçisin' : 'Çevrimdışısın'}
              description={
                online
                  ? 'Yeni görev teklifleri sana gönderiliyor.'
                  : 'Çevrimiçi olmadan görev teklifi alamazsın.'
              }
              checked={online}
              onChange={onToggleOnline ?? (() => {})}
            />
          </Surface>

          {loading ? (
            <SkeletonList count={2} />
          ) : (
            <>
              {/* ── Earnings ───────────────────────────────────────── */}
              <EarningsCard period={earnings} />

              {/* ── Daily goal ─────────────────────────────────────── */}
              {dailyGoal && (
                <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                    <Icon
                      icon={goalComplete ? CheckCircle2 : Target}
                      size="md"
                      color={goalComplete ? theme.colors.feedback.success : theme.colors.text.accent}
                    />
                    <Typography variant="bodyStrong" style={{ flex: 1 }}>
                      {goalComplete ? 'Günlük hedefi tamamladın' : 'Günlük hedef'}
                    </Typography>
                    <Typography variant="caption" tone="secondary" tabular>
                      {dailyGoal.done}/{dailyGoal.target}
                    </Typography>
                  </View>
                  <ProgressBar
                    value={dailyGoal.done / dailyGoal.target}
                    tone={goalComplete ? 'success' : 'brand'}
                  />
                  {goalComplete && (
                    <Typography variant="micro" tone="success">
                      Bugünkü bonusun kazancına eklendi.
                    </Typography>
                  )}
                </Surface>
              )}

              {/* ── Performance ────────────────────────────────────── */}
              <ResponsiveGrid minColumnWidth={150}>
                <MetricCard
                  label="Bugün tamamlanan"
                  value={String(courier.todayDeliveries ?? 0)}
                  icon={Package}
                  variant="compact"
                />
                <MetricCard
                  label="Puanın"
                  value={courier.rating.toFixed(1)}
                  icon={Star}
                  tone="success"
                  variant="compact"
                />
              </ResponsiveGrid>

              {/* ── Active task ────────────────────────────────────── */}
              {activeTask && (
                <View style={{ gap: theme.spacing.md }}>
                  <SectionTitle title="Aktif görevin" />
                  <DeliveryCard
                    delivery={activeTask}
                    variant="courier"
                    highlighted
                    onPress={() => onOpenTask?.(activeTask)}
                    primaryAction={{
                      label: 'Göreve devam et',
                      onPress: () => onOpenTask?.(activeTask),
                    }}
                  />
                </View>
              )}

              {/* ── New offers ─────────────────────────────────────── */}
              <View style={{ gap: theme.spacing.md }}>
                <SectionTitle title="Yeni görevler" />

                {!online ? (
                  <InlineAlert
                    tone="warning"
                    icon={Timer}
                    title="Çevrimdışısın"
                    message="Görev teklifi almak için çevrimiçi ol."
                  />
                ) : newTasks.length === 0 ? (
                  <Surface tone="elevated" radius="lg" bordered>
                    <StateView {...STATE_PRESETS.noActiveTasks} size="compact" />
                  </Surface>
                ) : (
                  newTasks.map((task, i) => (
                    <DeliveryCard
                      key={task.id + i}
                      delivery={task}
                      variant="courier"
                      onPress={() => onOpenTask?.(task)}
                      primaryAction={{
                        label: 'Kabul et',
                        onPress: () => onAcceptTask?.(task),
                      }}
                      secondaryAction={{ label: 'Reddet', onPress: () => {} }}
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
