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
} from './containers/SharedContainers';
import {
  CreateContainer,
  AddressPickerContainer,
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
} from './containers/CourierContainers';
import {
  OpsDeliveryDetailContainer,
  OpsAssignContainer,
  OpsAlertsContainer,
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
          <Stack.Screen name="Track" component={TrackContainer} />
          <Stack.Screen name="DeliveryDetail" component={DeliveryDetailContainer} />
          <Stack.Screen name="Rate" component={RateContainer} />
          <Stack.Screen name="Notifications" component={NotificationsContainer} />

          {/* Courier stack */}
          <Stack.Screen name="JobOffer" component={JobOfferContainer} />
          <Stack.Screen name="CourierTaskDetail" component={CourierTaskDetailContainer} />
          <Stack.Screen name="Pickup" component={PickupContainer} />
          <Stack.Screen name="OnTheWay" component={OnTheWayContainer} />
          <Stack.Screen name="Verify" component={VerifyContainer} />
          <Stack.Screen name="Failure" component={FailureContainer} />

          {/* Admin stack */}
          <Stack.Screen name="OpsDeliveryDetail" component={OpsDeliveryDetailContainer} />
          <Stack.Screen name="OpsAssign" component={OpsAssignContainer} />
          <Stack.Screen name="OpsAlerts" component={OpsAlertsContainer} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
