import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CourierHomeScreen } from '../../screens/courier/CourierHomeScreen';
import { JobOfferScreen } from '../../screens/courier/JobOfferScreen';
import {
  CourierTaskListScreen,
  CourierTaskDetailScreen,
  PickupScreen,
  OnTheWayScreen,
  DeliveryVerificationScreen,
  DeliveryFailureScreen,
} from '../../screens/courier/TaskScreens';
import { EarningsScreen, CourierPerformanceScreen } from '../../screens/courier/EarningsScreen';

import { deliveries, courierOffers } from '../../mocks/deliveries';
import { couriers } from '../../mocks/couriers';
import {
  earnings,
  earningsPeriods,
  earningsByDay,
  courierPerformance,
  customerReviews,
} from '../../mocks/analytics';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';
import { byId, keyFor, COURIER_TASKS } from '../wiring';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CourierHomeContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <CourierHomeScreen
      courier={couriers.burak}
      online
      earnings={earnings.today}
      activeTask={deliveries.onTheWay}
      newTasks={courierOffers}
      dailyGoal={{ done: 11, target: 15 }}
      onOpenTask={() => navigation.navigate(ROUTES.COURIER_TASK_DETAIL, { deliveryId: 'onTheWay' })}
      onAcceptTask={() => navigation.navigate(ROUTES.JOB_OFFER)}
    />
  );
}

export function JobOfferContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <JobOfferScreen
      offer={courierOffers[0]}
      onAccept={() =>
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.COURIER_TABS },
            { name: ROUTES.PICKUP, params: { deliveryId: 'accepted', stage: 'arriving' } },
          ],
        })
      }
      onReject={() => navigation.goBack()}
    />
  );
}

export function CourierTasksContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <CourierTaskListScreen
      tasks={COURIER_TASKS}
      onOpenTask={(d) => navigation.navigate(ROUTES.COURIER_TASK_DETAIL, { deliveryId: keyFor(d) })}
    />
  );
}

export function CourierTaskDetailContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'CourierTaskDetail'>>().params;
  return (
    <CourierTaskDetailScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onStart={() => navigation.navigate(ROUTES.PICKUP, { deliveryId, stage: 'arriving' })}
      onUpdateStatus={() => navigation.navigate(ROUTES.ON_THE_WAY, { deliveryId })}
    />
  );
}

export function PickupContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId, stage } = useRoute<RouteProp<RootStackParamList, 'Pickup'>>().params;
  return (
    <PickupScreen
      task={byId(deliveryId)}
      stage={stage}
      photoAttached={stage === 'arrived'}
      onBack={() => navigation.goBack()}
      onAdvance={() =>
        stage === 'arriving'
          ? navigation.replace(ROUTES.PICKUP, { deliveryId, stage: 'arrived' })
          : navigation.reset({
              index: 1,
              routes: [
                { name: ROUTES.COURIER_TABS },
                { name: ROUTES.ON_THE_WAY, params: { deliveryId: 'onTheWay' } },
              ],
            })
      }
    />
  );
}

export function OnTheWayContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OnTheWay'>>().params;
  return (
    <OnTheWayScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onArrived={() => navigation.navigate(ROUTES.VERIFY, { deliveryId })}
    />
  );
}

export function VerifyContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Verify'>>().params;
  return (
    <DeliveryVerificationScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onConfirm={() => navigation.reset({ index: 0, routes: [{ name: ROUTES.COURIER_TABS }] })}
      onFail={() => navigation.navigate(ROUTES.FAILURE, { deliveryId })}
    />
  );
}

export function FailureContainer() {
  const navigation = useNavigation<Nav>();
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Failure'>>().params;
  return (
    <DeliveryFailureScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onSubmit={() => navigation.reset({ index: 0, routes: [{ name: ROUTES.COURIER_TABS }] })}
    />
  );
}

export function EarningsContainer() {
  return (
    <EarningsScreen
      periods={earningsPeriods}
      byDay={earningsByDay}
      pendingPayout={842}
      totalEarnings={64_820}
    />
  );
}

export function PerformanceContainer() {
  return (
    <CourierPerformanceScreen
      courier={couriers.burak}
      performance={courierPerformance}
      reviews={customerReviews}
    />
  );
}
