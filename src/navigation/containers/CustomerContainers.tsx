import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CustomerHomeScreen } from '../../screens/customer/CustomerHomeScreen';
import { CreateDeliveryScreen, CREATE_STEPS } from '../../screens/customer/CreateDeliveryScreen';
import { AddressPickerScreen } from '../../screens/customer/AddressPickerScreen';
import { AddAddressScreen } from '../../screens/customer/AddAddressScreen';
import { MapPickerScreen } from '../../screens/customer/MapPickerScreen';
import { CourierChatScreen } from '../../screens/customer/CourierChatScreen';
import { TrackDeliveryScreen } from '../../screens/customer/TrackDeliveryScreen';
import { DeliveryHistoryScreen } from '../../screens/customer/DeliveryHistoryScreen';
import { DeliveryDetailScreen } from '../../screens/customer/DeliveryDetailScreen';
import { RateDeliveryScreen } from '../../screens/customer/RateDeliveryScreen';
import { NotificationsScreen } from '../../screens/customer/NotificationsScreen';

import { useDeliveryStore } from '../../stores/deliveryStore';
import { useChatStore } from '../../stores/chatStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { useAddressStore } from '../../stores/addressStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { hasActiveBenefits } from '../../utils/membership';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useCallPhone } from '../../hooks/useCallPhone';
import { useReverseGeocode } from '../../hooks/useReverseGeocode';
import { useCreateDeliveryForm } from '../../hooks/useCreateDeliveryForm';
import { useAddressForm } from '../../hooks/useAddressForm';
import { DEFAULT_MAP_COORD, type LatLng } from '../../design-system';
import { recentAddresses } from '../../mocks/addresses';
import { quickReplies } from '../../mocks/chat';
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
    savedCards,
    requestQuote,
    submit,
    price,
    quoteDistanceKm,
    quoting,
    quoteFailed,
    error,
  } = useCreateDeliveryForm();

  // Gönderici hesabın sahibidir; formda düzenlenmez, oturumdan gelir.
  const senderName = useAuthStore((s) => s.user?.name ?? 'Hesap sahibi');

  // Üyelik yalnızca AÇIKLAMA için — indirimi sunucu uygular, istemci istemez.
  const membership = useMembershipStore((s) => s.membership);
  const fetchMembership = useMembershipStore((s) => s.fetch);
  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);
  const membershipActive = hasActiveBenefits(membership, new Date());

  // Fiyat adımına gelince ücreti sorgula. `requestQuote` payload'a bağlı
  // olduğundan hız değiştiğinde de yeniden tetiklenir.
  useEffect(() => {
    if (step === 'price') requestQuote();
  }, [step, requestQuote]);

  return (
    <CreateDeliveryScreen
      step={step}
      form={form}
      savedAddresses={savedAddresses}
      savedCards={savedCards}
      onChange={update}
      onAddCard={() => navigation.navigate(ROUTES.ADD_CARD)}
      canProceed={canProceed(step)}
      senderName={senderName}
      price={price}
      priceDistanceKm={quoteDistanceKm ?? undefined}
      priceLoading={quoting}
      priceFailed={quoteFailed}
      membershipActive={membershipActive}
      onRetryQuote={requestQuote}
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
  const setPickedLocation = useAddressStore((s) => s.setPickedLocation);

  // Kayıtlı adresleri yükle — yeni eklenen adres de burada görünür.
  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  // GPS sonucunu köprüye koy ve yeni adres formunu aç — eskiden çözülen adres
  // kullanılmadan ekran kapanıyordu.
  const useCurrent = useCallback(async () => {
    const address = await resolve();
    if (address) {
      setPickedLocation(address);
      navigation.navigate(ROUTES.ADD_ADDRESS);
    }
    // İzin reddedilirse ekran locationPermission='denied' ile durumu gösterir.
  }, [resolve, setPickedLocation, navigation]);

  return (
    <AddressPickerScreen
      // Profil → Adreslerim: adres defteri. Onay butonu yok, satır düzenler.
      mode="book"
      savedAddresses={saved.length ? saved : undefined}
      locationPermission={permission}
      locating={loading}
      onUseCurrentLocation={useCurrent}
      onPickOnMap={() => navigation.navigate(ROUTES.MAP_PICKER)}
      onRequestLocationPermission={useCurrent}
      onAddAddress={() => navigation.navigate(ROUTES.ADD_ADDRESS)}
      onEditAddress={(a) => navigation.navigate(ROUTES.ADD_ADDRESS, { addressId: a.id })}
      onClose={() => navigation.goBack()}
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

  // Haritadan dönen konumu forma yaz, sonra köprüyü temizle. Koordinat metinle
  // BİRLİKTE yazılır — hem kaydedilsin hem de applyAddressPatch onu düşürmesin.
  useEffect(() => {
    if (pickedLocation) {
      update({
        fullAddress: pickedLocation.fullAddress,
        city: pickedLocation.city,
        district: pickedLocation.district,
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
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
        latitude: address.latitude,
        longitude: address.longitude,
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

  // Haritanın merkezi zaten seçili sayılır: kullanıcı hiç kaydırmadan
  // onaylarsa sessizce hiçbir şey olmasın.
  const [coord, setCoord] = useState<LatLng>(initialCoord ?? DEFAULT_MAP_COORD);
  const { resolve, loading } = useReverseGeocode();
  const setPickedLocation = useAddressStore((s) => s.setPickedLocation);

  const onConfirm = useCallback(async () => {
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
  const { online } = useNetworkStatus();
  // resolve() izni de istiyor; harita üzerindeki "İzin ver" bunu tetikler.
  const { resolve: requestLocationPermission } = useCurrentLocation();
  const callPhone = useCallPhone();

  // Mount'ta çek + 15 sn'de bir yenile (socket Faz 6'da).
  useEffect(() => {
    fetchById(deliveryId);
    const t = setInterval(() => fetchById(deliveryId), 15_000);
    return () => clearInterval(t);
  }, [deliveryId, fetchById]);

  const delivery = current ?? byId(deliveryId);
  const courierPhone = delivery.courier?.phone;

  return (
    <TrackDeliveryScreen
      delivery={delivery}
      offline={!online}
      onBack={() => navigation.goBack()}
      // Kurye tarafıyla ortak hook: numara doğrulaması ve hata mesajı tek yerde.
      onCallCourier={courierPhone ? () => callPhone(courierPhone, 'Kurye') : undefined}
      onMessageCourier={
        delivery.courier
          ? () => navigation.navigate(ROUTES.COURIER_CHAT, { deliveryId })
          : undefined
      }
      onSupport={() => navigation.navigate(ROUTES.HELP_SUPPORT)}
      // Haritadaki "İzin ver" gerçekten izin istesin.
      onRequestLocationPermission={requestLocationPermission}
    />
  );
}

export function CourierChatContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'CourierChat'>>().params;
  const current = useDeliveryStore((s) => s.current);
  const messages = useChatStore((s) => s.messages);
  const sending = useChatStore((s) => s.sending);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const send = useChatStore((s) => s.send);

  const delivery = current ?? byId(deliveryId);
  const courier = delivery.courier;
  const phone = courier?.phone;

  useEffect(() => {
    fetchMessages(deliveryId);
  }, [deliveryId, fetchMessages]);

  return (
    <CourierChatScreen
      courierName={courier?.fullName ?? 'Kurye'}
      courierAvatarUrl={courier?.avatarUrl}
      messages={messages}
      quickReplies={quickReplies}
      sending={sending}
      onSend={(text) => send(deliveryId, text)}
      onCall={
        phone
          ? () =>
              Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() =>
                Alert.alert('Aranamadı', phone, [{ text: 'Tamam' }]),
              )
          : undefined
      }
      onBack={() => navigation.goBack()}
    />
  );
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
      onSupport={() => navigation.navigate(ROUTES.HELP_SUPPORT)}
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
