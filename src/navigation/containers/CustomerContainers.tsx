import { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CustomerHomeScreen } from '../../screens/customer/CustomerHomeScreen';
import { CreateDeliveryScreen, CREATE_STEPS } from '../../screens/customer/CreateDeliveryScreen';
import { AddressPickerScreen } from '../../screens/customer/AddressPickerScreen';
import { AddAddressScreen } from '../../screens/customer/AddAddressScreen';
import { MapPickerScreen } from '../../screens/customer/MapPickerScreen';
import { TrackDeliveryScreen } from '../../screens/customer/TrackDeliveryScreen';
import { DeliveryHistoryScreen } from '../../screens/customer/DeliveryHistoryScreen';
import { DeliveryDetailScreen } from '../../screens/customer/DeliveryDetailScreen';
import { RateDeliveryScreen } from '../../screens/customer/RateDeliveryScreen';
import { NotificationsScreen } from '../../screens/customer/NotificationsScreen';

import { useDeliveryStore } from '../../stores/deliveryStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { useAddressStore } from '../../stores/addressStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useReverseGeocode } from '../../hooks/useReverseGeocode';
import { useCreateDeliveryForm } from '../../hooks/useCreateDeliveryForm';
import { useAddressForm } from '../../hooks/useAddressForm';
import type { LatLng } from '../../design-system';
import { recentAddresses } from '../../mocks/addresses';
import type { Address, Delivery } from '../../types';
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActive();
    fetchHistory();
    fetchNotifications(role ?? 'customer');
  }, [fetchActive, fetchHistory, fetchNotifications, role]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchActive(), fetchHistory()]);
    setRefreshing(false);
  }, [fetchActive, fetchHistory]);

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
      refreshing={refreshing}
      onRefresh={refresh}
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
  const {
    form,
    update,
    reset,
    canProceed,
    savedAddresses,
    requestQuote,
    submit,
    price,
    quoting,
    quoteFailed,
    error,
  } = useCreateDeliveryForm();

  // Fiyat adımına gelince ücreti sorgula (payload hazırsa).
  useEffect(() => {
    if (step === 'price') requestQuote();
  }, [step, requestQuote]);

  return (
    <CreateDeliveryScreen
      step={step}
      form={form}
      savedAddresses={savedAddresses}
      onChange={update}
      canProceed={canProceed(step)}
      price={price}
      priceLoading={quoting}
      priceFailed={quoteFailed}
      errorText={error}
      onNext={async () => {
        if (next) {
          navigation.replace(ROUTES.CREATE, { step: next.key });
          return;
        }
        // Son adım (confirm): oluştur → formu sıfırla → takip ekranına reset.
        await submit();
        reset();
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.CUSTOMER_TABS },
            { name: ROUTES.TRACK, params: { deliveryId: 'onTheWay' } },
          ],
        });
      }}
      onBack={() => prev && navigation.replace(ROUTES.CREATE, { step: prev.key })}
      onClose={() => {
        reset();
        navigation.reset({ index: 0, routes: [{ name: ROUTES.CUSTOMER_TABS }] });
      }}
    />
  );
}

export function AddressPickerContainer() {
  const navigation = useNavigation<Nav>();
  const { resolve, loading, permission } = useCurrentLocation();
  const saved = useAddressStore((s) => s.saved);
  const fetchSaved = useAddressStore((s) => s.fetchSaved);

  // Kayıtlı adresleri yükle — yeni eklenen adres de burada görünür.
  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const useCurrent = useCallback(async () => {
    const address = await resolve();
    if (address) navigation.goBack();
    // İzin reddedilirse ekran locationPermission='denied' ile durumu gösterir.
  }, [resolve, navigation]);

  return (
    <AddressPickerScreen
      savedAddresses={saved.length ? saved : undefined}
      locationPermission={permission === 'denied' ? 'denied' : 'granted'}
      locating={loading}
      onUseCurrentLocation={useCurrent}
      onAddAddress={() => navigation.navigate(ROUTES.ADD_ADDRESS)}
      onEditAddress={(a) => navigation.navigate(ROUTES.ADD_ADDRESS, { addressId: a.id })}
      onClose={() => navigation.goBack()}
      onSelect={() => navigation.goBack()}
    />
  );
}

export function AddAddressContainer() {
  const params = useRoute<RouteProp<RootStackParamList, 'AddAddress'>>().params;
  const addressId = params?.addressId;
  const saved = useAddressStore((s) => s.saved);
  const fetchSaved = useAddressStore((s) => s.fetchSaved);

  // Düzenlemeye derin bağlantıyla girilirse liste boşsa yükle.
  useEffect(() => {
    if (addressId && saved.length === 0) fetchSaved();
  }, [addressId, saved.length, fetchSaved]);

  const initial = addressId ? saved.find((a) => a.id === addressId) : undefined;

  // key: initial geç yüklenirse formu doğru veriyle yeniden kur (state init'i).
  return <AddAddressForm key={initial?.id ?? 'new'} initial={initial} />;
}

function AddAddressForm({ initial }: { initial?: Address }) {
  const navigation = useNavigation<Nav>();
  const { form, update, errors, canSubmit, saving, removing, error, isEditing, submit, remove } =
    useAddressForm(initial);
  const { resolve, loading: locating, permission } = useCurrentLocation();
  const pickedLocation = useAddressStore((s) => s.pickedLocation);
  const clearPickedLocation = useAddressStore((s) => s.clearPickedLocation);

  // Haritadan dönen konumu forma yaz, sonra köprüyü temizle.
  useEffect(() => {
    if (pickedLocation) {
      update({
        fullAddress: pickedLocation.fullAddress,
        city: pickedLocation.city,
        district: pickedLocation.district,
      });
      clearPickedLocation();
    }
  }, [pickedLocation, update, clearPickedLocation]);

  const useCurrentLocationFill = useCallback(async () => {
    const address = await resolve();
    if (address) {
      update({
        fullAddress: address.fullAddress,
        city: address.city,
        district: address.district,
      });
    }
  }, [resolve, update]);

  return (
    <AddAddressScreen
      form={form}
      editing={isEditing}
      errors={errors}
      onChange={update}
      canSubmit={canSubmit}
      saving={saving}
      locating={locating}
      locationDenied={permission === 'denied'}
      errorText={error}
      deleting={removing}
      onUseCurrentLocation={useCurrentLocationFill}
      onPickOnMap={() =>
        navigation.navigate(
          ROUTES.MAP_PICKER,
          initial?.latitude != null && initial?.longitude != null
            ? { lat: initial.latitude, lng: initial.longitude }
            : undefined,
        )
      }
      onSubmit={async () => {
        const result = await submit();
        if (result) navigation.goBack();
      }}
      onDelete={async () => {
        const ok = await remove();
        if (ok) navigation.goBack();
      }}
      onClose={() => navigation.goBack()}
    />
  );
}

export function MapPickerContainer() {
  const navigation = useNavigation<Nav>();
  const params = useRoute<RouteProp<RootStackParamList, 'MapPicker'>>().params;
  const initialCoord =
    params?.lat != null && params?.lng != null
      ? { latitude: params.lat, longitude: params.lng }
      : undefined;

  const [coord, setCoord] = useState<LatLng | undefined>(initialCoord);
  const { resolve, loading } = useReverseGeocode();
  const setPickedLocation = useAddressStore((s) => s.setPickedLocation);

  const onConfirm = useCallback(async () => {
    if (!coord) {
      navigation.goBack();
      return;
    }
    const address = await resolve(coord.latitude, coord.longitude);
    if (address) setPickedLocation(address);
    navigation.goBack();
  }, [coord, resolve, setPickedLocation, navigation]);

  return (
    <MapPickerScreen
      initialCoord={initialCoord}
      resolving={loading}
      onChange={setCoord}
      onConfirm={onConfirm}
      onClose={() => navigation.goBack()}
    />
  );
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  return (
    <DeliveryHistoryScreen
      deliveries={history}
      loading={loading && history.length === 0}
      errorText={error}
      refreshing={refreshing}
      onRefresh={onRefresh}
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
