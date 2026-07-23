import { useEffect } from 'react';
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

import { useDeliveryStore } from '../../stores/deliveryStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCreateDeliveryForm } from '../../hooks/useCreateDeliveryForm';
import { recentAddresses } from '../../mocks/addresses';
import type { Delivery } from '../../types';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';
import { byId, keyFor } from '../wiring';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const isClosed = (d: Delivery) =>
  d.status === 'delivered' || d.status === 'failed' || d.status === 'cancelled';

export function CustomerHomeContainer() {
  const navigation = useNavigation<Nav>();
  const userName = useAuthStore((s) => s.user?.name ?? 'Misafir');
  const active = useDeliveryStore((s) => s.active);
  const history = useDeliveryStore((s) => s.history);
  const loading = useDeliveryStore((s) => s.loading);
  const error = useDeliveryStore((s) => s.error);
  const fetchActive = useDeliveryStore((s) => s.fetchActive);
  const fetchHistory = useDeliveryStore((s) => s.fetchHistory);
  const unread = useNotificationStore((s) => s.unread);
  const fetchNotifications = useNotificationStore((s) => s.fetch);
  const role = useAuthStore((s) => s.role);
  const { online } = useNetworkStatus();

  useEffect(() => {
    fetchActive();
    fetchHistory();
    fetchNotifications(role ?? 'customer');
  }, [fetchActive, fetchHistory, fetchNotifications, role]);

  const refresh = () => {
    fetchActive();
    fetchHistory();
  };

  return (
    <CustomerHomeScreen
      userName={userName}
      activeDeliveries={active}
      recentAddresses={recentAddresses}
      pastDeliveries={history}
      unreadNotifications={unread}
      loading={loading && active.length === 0}
      errorText={error}
      offline={!online}
      onRetry={refresh}
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
  const { requestQuote, submit, quoting, quoteFailed, error } = useCreateDeliveryForm();

  // Fiyat adımına gelince ücreti sorgula.
  useEffect(() => {
    if (step === 'price') requestQuote();
  }, [step, requestQuote]);

  return (
    <CreateDeliveryScreen
      step={step}
      priceLoading={quoting}
      priceFailed={quoteFailed}
      errorText={error}
      onNext={async () => {
        if (next) {
          navigation.replace(ROUTES.CREATE, { step: next.key });
          return;
        }
        // Son adım (confirm): oluştur → takip ekranına reset.
        await submit();
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.CUSTOMER_TABS },
            { name: ROUTES.TRACK, params: { deliveryId: 'onTheWay' } },
          ],
        });
      }}
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
  const current = useDeliveryStore((s) => s.current);
  const fetchById = useDeliveryStore((s) => s.fetchById);

  // Mount'ta çek + 15 sn'de bir yenile (socket Faz 6'da).
  useEffect(() => {
    fetchById(deliveryId);
    const t = setInterval(() => fetchById(deliveryId), 15_000);
    return () => clearInterval(t);
  }, [deliveryId, fetchById]);

  return <TrackDeliveryScreen delivery={current ?? byId(deliveryId)} onBack={() => navigation.goBack()} />;
}

export function HistoryContainer() {
  const navigation = useNavigation<Nav>();
  const history = useDeliveryStore((s) => s.history);
  const loading = useDeliveryStore((s) => s.loading);
  const error = useDeliveryStore((s) => s.error);
  const fetchHistory = useDeliveryStore((s) => s.fetchHistory);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <DeliveryHistoryScreen
      deliveries={history}
      loading={loading && history.length === 0}
      errorText={error}
      onOpenDelivery={(d) => navigation.navigate(ROUTES.DELIVERY_DETAIL, { deliveryId: keyFor(d) })}
    />
  );
}

export function DeliveryDetailContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'DeliveryDetail'>>().params;
  const current = useDeliveryStore((s) => s.current);
  const fetchById = useDeliveryStore((s) => s.fetchById);

  useEffect(() => {
    fetchById(deliveryId);
  }, [deliveryId, fetchById]);

  return (
    <DeliveryDetailScreen
      delivery={current ?? byId(deliveryId)}
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

function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const loadItems = useNotificationStore((s) => s.fetch);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const role = useAuthStore((s) => s.role);
  useEffect(() => {
    loadItems(role ?? 'customer');
  }, [loadItems, role]);
  return { items, markAllRead };
}

export function NotificationsTabContainer() {
  const navigation = useNavigation<Nav>();
  const { items, markAllRead } = useNotifications();
  return (
    <NotificationsScreen
      notifications={items}
      activeTab="notifications"
      onMarkAllRead={markAllRead}
      onOpen={() => navigation.navigate(ROUTES.TRACK, { deliveryId: 'onTheWay' })}
    />
  );
}

export function NotificationsContainer() {
  const navigation = useNavigation<Nav>();
  const { items, markAllRead } = useNotifications();
  return (
    <NotificationsScreen
      notifications={items}
      onMarkAllRead={markAllRead}
      onBack={() => navigation.goBack()}
      onOpen={() => navigation.navigate(ROUTES.TRACK, { deliveryId: 'onTheWay' })}
    />
  );
}
