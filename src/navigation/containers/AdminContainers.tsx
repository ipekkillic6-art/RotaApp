import { useEffect } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OpsDashboardScreen } from '../../screens/admin/OpsDashboardScreen';
import {
  OpsDeliveryListScreen,
  CourierAssignmentScreen,
  OpsDeliveryDetailScreen,
} from '../../screens/admin/OpsDeliveryScreens';
import { OpsCourierListScreen, OpsAnalyticsScreen } from '../../screens/admin/OpsCourierScreens';
import { NotificationsScreen } from '../../screens/customer/NotificationsScreen';

import { useOpsStore } from '../../stores/opsStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { deliveries } from '../../mocks/deliveries';
import { assignmentCandidates, courierList } from '../../mocks/couriers';
import { opsMetrics, regionBreakdown, cancellationReasons } from '../../mocks/analytics';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';
import { byId, keyFor } from '../wiring';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OpsDashboardContainer() {
  const navigation = useNavigation<Nav>();
  const metrics = useOpsStore((s) => s.metrics);
  const loading = useOpsStore((s) => s.loading);
  const fetchMetrics = useOpsStore((s) => s.fetchMetrics);

  // Görünürken 30 sn'de bir yenile.
  useEffect(() => {
    fetchMetrics();
    const t = setInterval(fetchMetrics, 30_000);
    return () => clearInterval(t);
  }, [fetchMetrics]);

  return (
    <OpsDashboardScreen
      metrics={metrics ?? opsMetrics}
      attentionQueue={[deliveries.delayed, deliveries.failed, deliveries.unpriced]}
      unreadAlerts={3}
      loading={loading && !metrics}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.OPS_DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
      onAssignCourier={(d) => navigation.navigate(ROUTES.OPS_ASSIGN, { deliveryId: keyFor(d) })}
    />
  );
}

export function OpsDeliveriesContainer() {
  const navigation = useNavigation<Nav>();
  const list = useOpsStore((s) => s.deliveries);
  const loading = useOpsStore((s) => s.loading);
  const fetchDeliveries = useOpsStore((s) => s.fetchDeliveries);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return (
    <OpsDeliveryListScreen
      deliveries={list}
      loading={loading && list.length === 0}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.OPS_DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
    />
  );
}

export function OpsDeliveryDetailContainer() {
  const navigation = useNavigation<Nav>();
  const cancelDelivery = useOpsStore((s) => s.cancelDelivery);
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OpsDeliveryDetail'>>().params;
  return (
    <OpsDeliveryDetailScreen
      delivery={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onReassign={() => navigation.navigate(ROUTES.OPS_ASSIGN, { deliveryId })}
      onCancel={() => {
        cancelDelivery(deliveryId);
        navigation.goBack();
      }}
    />
  );
}

export function OpsAssignContainer() {
  const navigation = useNavigation<Nav>();
  const assign = useOpsStore((s) => s.assign);
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OpsAssign'>>().params;
  return (
    <CourierAssignmentScreen
      delivery={byId(deliveryId)}
      candidates={assignmentCandidates}
      onBack={() => navigation.goBack()}
      onAssign={(courier) => {
        assign(deliveryId, courier.id);
        navigation.reset({ index: 0, routes: [{ name: ROUTES.ADMIN_TABS }] });
      }}
    />
  );
}

export function OpsCouriersContainer() {
  const couriers = useOpsStore((s) => s.couriers);
  const loading = useOpsStore((s) => s.loading);
  const fetchCouriers = useOpsStore((s) => s.fetchCouriers);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  return <OpsCourierListScreen couriers={couriers} loading={loading && couriers.length === 0} />;
}

export function OpsAnalyticsContainer() {
  const metrics = useOpsStore((s) => s.metrics);
  const couriers = useOpsStore((s) => s.couriers);
  return (
    <OpsAnalyticsScreen
      metrics={metrics ?? opsMetrics}
      regions={regionBreakdown}
      cancellations={cancellationReasons}
      topCouriers={(couriers.length ? couriers : courierList).slice(0, 3)}
    />
  );
}

export function OpsAlertsContainer() {
  const navigation = useNavigation<Nav>();
  const items = useNotificationStore((s) => s.items);
  const loadItems = useNotificationStore((s) => s.fetch);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    loadItems('admin');
  }, [loadItems]);

  return (
    <NotificationsScreen
      notifications={items}
      role="admin"
      onMarkAllRead={markAllRead}
      onBack={() => navigation.goBack()}
    />
  );
}
