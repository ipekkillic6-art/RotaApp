import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CustomerHomeScreen } from '../../screens/customer/CustomerHomeScreen';
import { CreateDeliveryScreen, CREATE_STEPS } from '../../screens/customer/CreateDeliveryScreen';
import { AddressPickerScreen } from '../../screens/customer/AddressPickerScreen';
import { TrackDeliveryScreen } from '../../screens/customer/TrackDeliveryScreen';
import { DeliveryHistoryScreen } from '../../screens/customer/DeliveryHistoryScreen';
import { DeliveryDetailScreen } from '../../screens/customer/DeliveryDetailScreen';
import { RateDeliveryScreen } from '../../screens/customer/RateDeliveryScreen';
import { NotificationsScreen } from '../../screens/customer/NotificationsScreen';

import { deliveries, deliveryHistory } from '../../mocks/deliveries';
import { recentAddresses } from '../../mocks/addresses';
import { customerNotifications } from '../../mocks/notifications';
import type { Delivery } from '../../types';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';
import { byId, keyFor } from '../wiring';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const isClosed = (d: Delivery) =>
  d.status === 'delivered' || d.status === 'failed' || d.status === 'cancelled';

export function CustomerHomeContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <CustomerHomeScreen
      userName="Deniz Aydın"
      activeDeliveries={[deliveries.onTheWay]}
      recentAddresses={recentAddresses}
      pastDeliveries={deliveryHistory}
      unreadNotifications={3}
      onCreateDelivery={() => navigation.navigate(ROUTES.CREATE, { step: 'pickup' })}
      onOpenDelivery={(d) =>
        isClosed(d)
          ? navigation.navigate(ROUTES.DELIVERY_DETAIL, { deliveryId: keyFor(d) })
          : navigation.navigate(ROUTES.TRACK, { deliveryId: keyFor(d) })
      }
      onOpenNotifications={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
    />
  );
}

export function CreateContainer() {
  const navigation = useNavigation<Nav>();
  const { step } = useRoute<RouteProp<RootStackParamList, 'Create'>>().params;
  const index = CREATE_STEPS.findIndex((s) => s.key === step);
  const next = CREATE_STEPS[index + 1];
  const prev = CREATE_STEPS[index - 1];

  return (
    <CreateDeliveryScreen
      step={step}
      onNext={() =>
        next
          ? navigation.replace(ROUTES.CREATE, { step: next.key })
          : navigation.reset({
              index: 1,
              routes: [
                { name: ROUTES.CUSTOMER_TABS },
                { name: ROUTES.TRACK, params: { deliveryId: 'pending' } },
              ],
            })
      }
      onBack={() => prev && navigation.replace(ROUTES.CREATE, { step: prev.key })}
      onClose={() => navigation.reset({ index: 0, routes: [{ name: ROUTES.CUSTOMER_TABS }] })}
    />
  );
}

export function AddressPickerContainer() {
  const navigation = useNavigation<Nav>();
  return <AddressPickerScreen onClose={() => navigation.goBack()} onSelect={() => navigation.goBack()} />;
}

export function TrackContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Track'>>().params;
  return <TrackDeliveryScreen delivery={byId(deliveryId)} onBack={() => navigation.goBack()} />;
}

export function HistoryContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <DeliveryHistoryScreen
      deliveries={deliveryHistory}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
    />
  );
}

export function DeliveryDetailContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'DeliveryDetail'>>().params;
  return (
    <DeliveryDetailScreen
      delivery={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onRate={() => navigation.navigate(ROUTES.RATE, { deliveryId })}
      onReorder={() =>
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.CUSTOMER_TABS },
            { name: ROUTES.CREATE, params: { step: 'pickup' } },
          ],
        })
      }
    />
  );
}

export function RateContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Rate'>>().params;
  const delivery = byId(deliveryId);
  return (
    <RateDeliveryScreen
      courier={delivery.courier}
      trackingNumber={delivery.trackingNumber}
      onBack={() => navigation.goBack()}
      onSubmit={() => navigation.reset({ index: 0, routes: [{ name: ROUTES.CUSTOMER_TABS }] })}
    />
  );
}

export function NotificationsTabContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsScreen
      notifications={customerNotifications}
      activeTab="notifications"
      onOpen={() => navigation.navigate(ROUTES.TRACK, { deliveryId: 'onTheWay' })}
    />
  );
}

export function NotificationsContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsScreen
      notifications={customerNotifications}
      onBack={() => navigation.goBack()}
      onOpen={() => navigation.navigate(ROUTES.TRACK, { deliveryId: 'onTheWay' })}
    />
  );
}
