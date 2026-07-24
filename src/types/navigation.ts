import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CreateStepKey } from '../screens/customer/CreateDeliveryScreen';

/**
 * Navigasyon tip sözleşmesi.
 *
 * kuryeApp'teki DemoRoute union'ının React Navigation karşılığı (29 rota).
 * Rota isimleri ekranlara 1:1 eşlenir. Yanlış rota adı = derleme hatası.
 */

/* ── Rol bazlı tab param list'leri ──────────────────────────────────────── */

export type CustomerTabParamList = {
  home: undefined;
  deliveries: undefined;
  notifications: undefined;
  profile: undefined;
};

export type CourierTabParamList = {
  home: undefined;
  tasks: undefined;
  earnings: undefined;
  profile: undefined;
};

export type AdminTabParamList = {
  dashboard: undefined;
  deliveries: undefined;
  couriers: undefined;
  profile: undefined;
};

/* ── Kök stack ──────────────────────────────────────────────────────────── */

export type RootStackParamList = {
  /* shared / auth */
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  RoleSelect: undefined;

  /* rol tab host'ları */
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  CourierTabs: NavigatorScreenParams<CourierTabParamList> | undefined;
  AdminTabs: NavigatorScreenParams<AdminTabParamList> | undefined;

  /* customer stack (tab üstüne push'lananlar) */
  Create: { step: CreateStepKey };
  AddressPicker: undefined;
  AddAddress: { addressId?: string } | undefined;
  Track: { deliveryId: string };
  DeliveryDetail: { deliveryId: string };
  Rate: { deliveryId: string };
  Notifications: undefined;

  /* courier stack */
  JobOffer: undefined;
  CourierTaskDetail: { deliveryId: string };
  Pickup: { deliveryId: string; stage: 'arriving' | 'arrived' };
  OnTheWay: { deliveryId: string };
  Verify: { deliveryId: string };
  Failure: { deliveryId: string };

  /* admin stack */
  OpsDeliveryDetail: { deliveryId: string };
  OpsAssign: { deliveryId: string };
  OpsAlerts: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
