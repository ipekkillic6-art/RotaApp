import type { RootStackParamList } from '../types/navigation';

/**
 * Rota adları tek yerde. Ekranlarda/container'larda string yazılmaz → ROUTES.X.
 * `satisfies` sayesinde ParamList'te olmayan bir rota yazmak derleme hatasıdır.
 */
export const ROUTES = {
  // shared / auth
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',
  ROLE_SELECT: 'RoleSelect',
  PRIVACY_SECURITY: 'PrivacySecurity',
  HELP_SUPPORT: 'HelpSupport',
  PAYMENT_METHODS: 'PaymentMethods',
  ADD_CARD: 'AddCard',

  // rol tab host'ları
  CUSTOMER_TABS: 'CustomerTabs',
  COURIER_TABS: 'CourierTabs',
  ADMIN_TABS: 'AdminTabs',

  // customer
  CREATE: 'Create',
  ADDRESS_PICKER: 'AddressPicker',
  ADD_ADDRESS: 'AddAddress',
  MAP_PICKER: 'MapPicker',
  TRACK: 'Track',
  DELIVERY_DETAIL: 'DeliveryDetail',
  RATE: 'Rate',
  NOTIFICATIONS: 'Notifications',

  // courier
  JOB_OFFER: 'JobOffer',
  COURIER_TASK_DETAIL: 'CourierTaskDetail',
  PICKUP: 'Pickup',
  ON_THE_WAY: 'OnTheWay',
  VERIFY: 'Verify',
  FAILURE: 'Failure',

  // admin
  OPS_DELIVERY_DETAIL: 'OpsDeliveryDetail',
  OPS_ASSIGN: 'OpsAssign',
  OPS_ALERTS: 'OpsAlerts',
  OPS_ANALYTICS: 'OpsAnalytics',

  // courier
  COURIER_PERFORMANCE: 'CourierPerformance',
} as const satisfies Record<string, keyof RootStackParamList>;
