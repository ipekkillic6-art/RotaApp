import { useEffect, useState } from 'react';
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

import { useCourierStore } from '../../stores/courierStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
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

const JOB_OFFER_SECONDS = 22;

export function CourierHomeContainer() {
  const navigation = useNavigation<Nav>();
  const profile = useCourierStore((s) => s.profile);
  const online = useCourierStore((s) => s.online);
  const activeTask = useCourierStore((s) => s.activeTask);
  const offers = useCourierStore((s) => s.offers);
  const setOnline = useCourierStore((s) => s.setOnline);
  const restoreOnline = useCourierStore((s) => s.restoreOnline);
  const fetchProfile = useCourierStore((s) => s.fetchProfile);
  const fetchOffers = useCourierStore((s) => s.fetchOffers);
  const fetchActiveTask = useCourierStore((s) => s.fetchActiveTask);
  const { online: netOnline } = useNetworkStatus();

  useEffect(() => {
    restoreOnline();
    fetchProfile();
    fetchOffers();
    fetchActiveTask();
  }, [restoreOnline, fetchProfile, fetchOffers, fetchActiveTask]);

  return (
    <CourierHomeScreen
      courier={profile ?? couriers.burak}
      online={online}
      onToggleOnline={(v) => setOnline(v)}
      offline={!netOnline}
      loading={!profile}
      earnings={earnings.today}
      activeTask={activeTask ?? undefined}
      newTasks={offers}
      dailyGoal={{ done: 11, target: 15 }}
      onOpenTask={() =>
        navigation.navigate(ROUTES.COURIER_TASK_DETAIL, {
          deliveryId: activeTask ? keyFor(activeTask) : 'onTheWay',
        })
      }
      onAcceptTask={() => navigation.navigate(ROUTES.JOB_OFFER)}
    />
  );
}

export function JobOfferContainer() {
  const navigation = useNavigation<Nav>();
  const updateStatus = useCourierStore((s) => s.updateStatus);
  const [secondsLeft, setSecondsLeft] = useState(JOB_OFFER_SECONDS);
  const offer = courierOffers[0];

  // Gerçek geri sayım.
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Süre dolunca otomatik reddet.
  useEffect(() => {
    if (secondsLeft === 0) navigation.goBack();
  }, [secondsLeft, navigation]);

  return (
    <JobOfferScreen
      offer={offer}
      secondsLeft={secondsLeft}
      onAccept={() => {
        updateStatus(offer.id, 'accepted');
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.COURIER_TABS },
            { name: ROUTES.PICKUP, params: { deliveryId: 'accepted', stage: 'arriving' } },
          ],
        });
      }}
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
  const updateStatus = useCourierStore((s) => s.updateStatus);
  const { deliveryId, stage } = useRoute<RouteProp<RootStackParamList, 'Pickup'>>().params;
  return (
    <PickupScreen
      task={byId(deliveryId)}
      stage={stage}
      photoAttached={stage === 'arrived'}
      onBack={() => navigation.goBack()}
      onAdvance={() => {
        if (stage === 'arriving') {
          navigation.replace(ROUTES.PICKUP, { deliveryId, stage: 'arrived' });
          return;
        }
        // Paket alındı → yola çık.
        updateStatus(deliveryId, 'picked_up');
        navigation.reset({
          index: 1,
          routes: [
            { name: ROUTES.COURIER_TABS },
            { name: ROUTES.ON_THE_WAY, params: { deliveryId: 'onTheWay' } },
          ],
        });
      }}
    />
  );
}

export function OnTheWayContainer() {
  const navigation = useNavigation<Nav>();
  const updateStatus = useCourierStore((s) => s.updateStatus);
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'OnTheWay'>>().params;

  useEffect(() => {
    updateStatus(deliveryId, 'on_the_way');
  }, [deliveryId, updateStatus]);

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
  const updateStatus = useCourierStore((s) => s.updateStatus);
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Verify'>>().params;
  return (
    <DeliveryVerificationScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onConfirm={() => {
        updateStatus(deliveryId, 'delivered');
        navigation.reset({ index: 0, routes: [{ name: ROUTES.COURIER_TABS }] });
      }}
      onFail={() => navigation.navigate(ROUTES.FAILURE, { deliveryId })}
    />
  );
}

export function FailureContainer() {
  const navigation = useNavigation<Nav>();
  const updateStatus = useCourierStore((s) => s.updateStatus);
  const { deliveryId } = useRoute<RouteProp<RootStackParamList, 'Failure'>>().params;
  return (
    <DeliveryFailureScreen
      task={byId(deliveryId)}
      onBack={() => navigation.goBack()}
      onSubmit={() => {
        updateStatus(deliveryId, 'failed');
        navigation.reset({ index: 0, routes: [{ name: ROUTES.COURIER_TABS }] });
      }}
    />
  );
}

// Kazanç ve performans salt-okunur ekranlar — mock veriyle beslenir
// (courierService de aynı mock'u döndürür; gerçek backend'de servise geçilir).
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
