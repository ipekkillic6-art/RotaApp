import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type {
  CustomerTabParamList,
  CourierTabParamList,
  AdminTabParamList,
} from '../types/navigation';
import { makeRoleTabBar } from './RoleTabBar';

import {
  CustomerHomeContainer,
  HistoryContainer,
  NotificationsTabContainer,
} from './containers/CustomerContainers';
import { ProfileContainer } from './containers/SharedContainers';
import {
  CourierHomeContainer,
  CourierTasksContainer,
  EarningsContainer,
} from './containers/CourierContainers';
import {
  OpsDashboardContainer,
  OpsDeliveriesContainer,
  OpsCouriersContainer,
} from './containers/AdminContainers';

const Customer = createBottomTabNavigator<CustomerTabParamList>();
const Courier = createBottomTabNavigator<CourierTabParamList>();
const Admin = createBottomTabNavigator<AdminTabParamList>();

const screenOptions = { headerShown: false } as const;

export function CustomerTabs() {
  return (
    <Customer.Navigator
      screenOptions={screenOptions}
      tabBar={makeRoleTabBar('customer')}
    >
      <Customer.Screen name="home" component={CustomerHomeContainer} />
      <Customer.Screen name="deliveries" component={HistoryContainer} />
      <Customer.Screen name="notifications" component={NotificationsTabContainer} />
      <Customer.Screen name="profile" component={ProfileContainer} />
    </Customer.Navigator>
  );
}

export function CourierTabs() {
  return (
    <Courier.Navigator screenOptions={screenOptions} tabBar={makeRoleTabBar('courier')}>
      <Courier.Screen name="home" component={CourierHomeContainer} />
      <Courier.Screen name="tasks" component={CourierTasksContainer} />
      <Courier.Screen name="earnings" component={EarningsContainer} />
      <Courier.Screen name="profile" component={ProfileContainer} />
    </Courier.Navigator>
  );
}

export function AdminTabs() {
  return (
    <Admin.Navigator screenOptions={screenOptions} tabBar={makeRoleTabBar('admin')}>
      <Admin.Screen name="dashboard" component={OpsDashboardContainer} />
      <Admin.Screen name="deliveries" component={OpsDeliveriesContainer} />
      <Admin.Screen name="couriers" component={OpsCouriersContainer} />
      <Admin.Screen name="profile" component={ProfileContainer} />
    </Admin.Navigator>
  );
}
