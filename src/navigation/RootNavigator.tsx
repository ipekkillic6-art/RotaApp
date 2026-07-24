import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import type { UserRole } from '../types';
import { useAuthStore } from '../stores/authStore';
import { CustomerTabs, CourierTabs, AdminTabs } from './RoleTabs';
import {
  OnboardingContainer,
  LoginContainer,
  RegisterContainer,
  RoleSelectContainer,
  PrivacySecurityContainer,
  HelpSupportContainer,
  PaymentMethodsContainer,
  AddCardContainer,
} from './containers/SharedContainers';
import {
  CreateContainer,
  AddressPickerContainer,
  AddAddressContainer,
  MapPickerContainer,
  TrackContainer,
  DeliveryDetailContainer,
  RateContainer,
  NotificationsContainer,
} from './containers/CustomerContainers';
import {
  JobOfferContainer,
  CourierTaskDetailContainer,
  PickupContainer,
  OnTheWayContainer,
  VerifyContainer,
  FailureContainer,
  PerformanceContainer,
} from './containers/CourierContainers';
import {
  OpsDeliveryDetailContainer,
  OpsAssignContainer,
  OpsAlertsContainer,
  OpsAnalyticsContainer,
} from './containers/AdminContainers';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Role göre tab host'u. */
function roleHome(role: UserRole) {
  if (role === 'courier') return <Stack.Screen name="CourierTabs" component={CourierTabs} />;
  if (role === 'admin') return <Stack.Screen name="AdminTabs" component={AdminTabs} />;
  return <Stack.Screen name="CustomerTabs" component={CustomerTabs} />;
}

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Girişsiz
        <Stack.Group>
          <Stack.Screen name="Onboarding" component={OnboardingContainer} />
          <Stack.Screen name="Login" component={LoginContainer} />
          <Stack.Screen name="Register" component={RegisterContainer} />
        </Stack.Group>
      ) : !role ? (
        // Girişli, rol seçilmedi
        <Stack.Screen name="RoleSelect" component={RoleSelectContainer} />
      ) : (
        // Girişli + rol: o rolün tab'ları + üstüne push'lanan ekranlar
        <Stack.Group>
          {roleHome(role)}

          {/* Customer stack */}
          <Stack.Screen name="Create" component={CreateContainer} />
          <Stack.Screen name="AddressPicker" component={AddressPickerContainer} />
          <Stack.Screen name="AddAddress" component={AddAddressContainer} />
          <Stack.Screen name="MapPicker" component={MapPickerContainer} />
          <Stack.Screen name="Track" component={TrackContainer} />
          <Stack.Screen name="DeliveryDetail" component={DeliveryDetailContainer} />
          <Stack.Screen name="Rate" component={RateContainer} />
          <Stack.Screen name="Notifications" component={NotificationsContainer} />

          {/* Ortak (her rol) — Profil'den açılır */}
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityContainer} />
          <Stack.Screen name="HelpSupport" component={HelpSupportContainer} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsContainer} />
          <Stack.Screen name="AddCard" component={AddCardContainer} />

          {/* Courier stack */}
          <Stack.Screen name="JobOffer" component={JobOfferContainer} />
          <Stack.Screen name="CourierPerformance" component={PerformanceContainer} />
          <Stack.Screen name="CourierTaskDetail" component={CourierTaskDetailContainer} />
          <Stack.Screen name="Pickup" component={PickupContainer} />
          <Stack.Screen name="OnTheWay" component={OnTheWayContainer} />
          <Stack.Screen name="Verify" component={VerifyContainer} />
          <Stack.Screen name="Failure" component={FailureContainer} />

          {/* Admin stack */}
          <Stack.Screen name="OpsDeliveryDetail" component={OpsDeliveryDetailContainer} />
          <Stack.Screen name="OpsAssign" component={OpsAssignContainer} />
          <Stack.Screen name="OpsAlerts" component={OpsAlertsContainer} />
          <Stack.Screen name="OpsAnalytics" component={OpsAnalyticsContainer} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
