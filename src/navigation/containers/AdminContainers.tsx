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

import { deliveries, opsDeliveries } from '../../mocks/deliveries';
import { courierList, assignmentCandidates } from '../../mocks/couriers';
import { opsNotifications } from '../../mocks/notifications';
import { opsMetrics, regionBreakdown, cancellationReasons } from '../../mocks/analytics';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';
import { byId, keyFor } from '../wiring';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OpsDashboardContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <OpsDashboardScreen
      metrics={opsMetrics}
      attentionQueue={[deliveries.delayed, deliveries.failed, deliveries.unpriced]}
      unreadAlerts={3}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.OPS_DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
      onAssignCourier={(d) => navigation.navigate(ROUTES.OPS_ASSIGN, { deliveryId: keyFor(d) })}
    />
  );
}

export function OpsDeliveriesContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <OpsDeliveryListScreen
      deliveries={opsDeliveries}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.OPS_DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
    />
  );
}

export function OpsDeliveryDetailContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OpsDeliveryDetail'>>().params;
  return (
    <OpsDeliveryDetailScreen
      delivery={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onReassign={() => navigation.navigate(ROUTES.OPS_ASSIGN, { deliveryId })}
      onCancel={() => navigation.goBack()}
    />
  );
}

export function OpsAssignContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OpsAssign'>>().params;
  return (
    <CourierAssignmentScreen
      delivery={byId(deliveryId)}
      candidates={assignmentCandidates}
      onBack={() => navigation.goBack()}
      onAssign={() => navigation.reset({ index: 0, routes: [{ name: ROUTES.ADMIN_TABS }] })}
    />
  );
}

export function OpsCouriersContainer() {
  return <OpsCourierListScreen couriers={courierList} />;
}

export function OpsAnalyticsContainer() {
  return (
    <OpsAnalyticsScreen
      metrics={opsMetrics}
      regions={regionBreakdown}
      cancellations={cancellationReasons}
      topCouriers={courierList.slice(0, 3)}
    />
  );
}

export function OpsAlertsContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsScreen
      notifications={opsNotifications}
      role="admin"
      onBack={() => navigation.goBack()}
    />
  );
}
