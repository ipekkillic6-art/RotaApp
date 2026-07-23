import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import { CustomerTabs, CourierTabs, AdminTabs } from './RoleTabs';
import {
  SplashContainer,
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

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      {/* Kimlik doğrulama (Faz 5'te authStore'a bağlanacak) */}
      <Stack.Screen name="Splash" component={SplashContainer} />
      <Stack.Screen name="Onboarding" component={OnboardingContainer} />
      <Stack.Screen name="Login" component={LoginContainer} />
      <Stack.Screen name="Register" component={RegisterContainer} />
      <Stack.Screen name="RoleSelect" component={RoleSelectContainer} />

      {/* Rol tab host'ları */}
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="CourierTabs" component={CourierTabs} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />

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
    </Stack.Navigator>
  );
}
