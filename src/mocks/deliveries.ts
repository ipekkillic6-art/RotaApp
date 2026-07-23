import type {
  Delivery,
  DeliveryStatus,
  PriceBreakdown,
  StatusEvent,
} from '../types';
import { HAPPY_PATH } from '../design-system/domain/delivery/status';
import { addresses } from './addresses';
import { couriers } from './couriers';

/**
 * Delivery fixtures.
 *
 * Timestamps are fixed strings rather than `Date.now()` offsets so stories are
 * deterministic — a visual diff should never fail because a clock moved.
 */

const DAY = '2026-07-22';

const at = (time: string) => `${DAY}T${time}:00+03:00`;

export function makePrice(
  base: number,
  distance: number,
  extras = 0,
  discount = 0,
): PriceBreakdown {
  return {
    base,
    distance,
    extras,
    discount,
    total: base + distance + extras - discount,
    currency: 'TRY',
  };
}

/** Builds the status history implied by reaching `status` on the happy path. */
export function makeHistory(status: DeliveryStatus, startHour = 9): StatusEvent[] {
  if (status === 'cancelled' || status === 'failed') {
    return [
      { status: 'pending', at: at(`${startHour}:02`), actor: 'Müşteri' },
      { status: 'assigning', at: at(`${startHour}:04`), actor: 'Sistem' },
      { status: 'assigned', at: at(`${startHour}:07`), actor: 'Sistem' },
      { status: 'accepted', at: at(`${startHour}:09`), actor: 'Kurye' },
      { status: 'picked_up', at: at(`${startHour}:28`), actor: 'Kurye' },
      { status: 'on_the_way', at: at(`${startHour}:31`), actor: 'Kurye' },
      {
        status,
        at: at(`${startHour + 1}:04`),
        actor: status === 'failed' ? 'Kurye' : 'Müşteri',
        note:
          status === 'failed'
            ? 'Alıcı adreste bulunamadı, 3 kez arandı.'
            : 'Müşteri talebiyle iptal edildi.',
      },
    ];
  }

  const reached = HAPPY_PATH.slice(0, HAPPY_PATH.indexOf(status) + 1);
  const minutes = [2, 4, 7, 9, 28, 31, 64];
  return reached.map((s, i) => ({
    status: s,
    at: at(`${startHour + Math.floor(minutes[i] / 60)}:${String(minutes[i] % 60).padStart(2, '0')}`),
    actor: i <= 1 ? 'Sistem' : 'Kurye',
  }));
}

let seq = 2840;
const nextTracking = () => `TR-${++seq}`;

interface DeliveryOverrides extends Partial<Delivery> {}

/**
 * Factory — the base for every fixture below. Stories that need a one-off
 * variation should call this rather than hand-editing a shared object.
 */
export function makeDelivery(overrides: DeliveryOverrides = {}): Delivery {
  const status = overrides.status ?? 'pending';
  return {
    id: `dlv-${seq}`,
    trackingNumber: nextTracking(),
    customerId: 'cus-01',
    customerName: 'İpek Kılıç',
    pickupAddress: addresses.officeLevent,
    dropoffAddress: addresses.homeKadikoy,
    packageType: 'small',
    packageDescription: 'A4 zarf içinde sözleşme evrakı',
    status,
    price: makePrice(59, 34, 0, 0),
    distanceKm: 11.4,
    estimatedDurationMinutes: 42,
    createdAt: at('09:02'),
    history: makeHistory(status),
    ...overrides,
  };
}

/* ── Named fixtures, one per meaningful state ───────────────────────────── */

export const deliveries = {
  pending: makeDelivery({ status: 'pending' }),

  assigning: makeDelivery({ status: 'assigning' }),

  assigned: makeDelivery({
    status: 'assigned',
    courierId: couriers.burak.id,
    courier: couriers.burak,
  }),

  accepted: makeDelivery({
    status: 'accepted',
    courierId: couriers.selin.id,
    courier: couriers.selin,
    deliveryCode: '4417',
  }),

  pickedUp: makeDelivery({
    status: 'picked_up',
    courierId: couriers.burak.id,
    courier: couriers.burak,
    deliveryCode: '8032',
  }),

  onTheWay: makeDelivery({
    status: 'on_the_way',
    courierId: couriers.burak.id,
    courier: couriers.burak,
    deliveryCode: '8032',
    estimatedDurationMinutes: 14,
    packageType: 'food',
    packageDescription: 'Sıcak yemek — 2 kutu',
  }),

  delivered: makeDelivery({
    status: 'delivered',
    courierId: couriers.ayse.id,
    courier: couriers.ayse,
    deliveredAt: at('10:06'),
    rating: 5,
    price: makePrice(59, 41, 15, 20),
  }),

  failed: makeDelivery({
    status: 'failed',
    courierId: couriers.hakan.id,
    courier: couriers.hakan,
    failureReason: 'recipient_absent',
    failureNote: 'Kapı 3 kez çalındı, telefon açılmadı.',
    packageType: 'fragile',
  }),

  cancelled: makeDelivery({
    status: 'cancelled',
    packageType: 'document',
    price: makePrice(59, 0, 0, 59),
  }),

  /** Edge case: past the promised window while still in transit. */
  delayed: makeDelivery({
    status: 'on_the_way',
    courierId: couriers.ayse.id,
    courier: couriers.ayse,
    isDelayed: true,
    deliveryCode: '1190',
    estimatedDurationMinutes: 68,
    dropoffAddress: addresses.warehouseTuzla,
    packageType: 'large',
  }),

  /** Edge case: assigned to nobody and priced at nothing. */
  unpriced: makeDelivery({
    status: 'pending',
    price: undefined,
    courier: undefined,
    courierId: undefined,
    packageDescription: undefined,
  }),

  /** Edge case: long names and addresses everywhere. */
  longContent: makeDelivery({
    status: 'on_the_way',
    customerName: 'Abdurrahman Hüseyinoğlu Karaağaçlıoğlu',
    courierId: couriers.longName.id,
    courier: couriers.longName,
    pickupAddress: addresses.longAddress,
    dropoffAddress: addresses.warehouseTuzla,
    packageType: 'special',
    packageDescription:
      'Kırılabilir cam vitrin panelleri, üç ayrı kutuda, üst üste konulmamalı ve nem almamalı',
    distanceKm: 47.8,
    estimatedDurationMinutes: 96,
    deliveryCode: '772041',
  }),

  /** Scheduled for later — the customer picked a window. */
  scheduled: makeDelivery({
    status: 'pending',
    scheduledAt: `${DAY}T16:30:00+03:00`,
    packageType: 'medium',
  }),
} satisfies Record<string, Delivery>;

export const activeDeliveries: Delivery[] = [
  deliveries.onTheWay,
  deliveries.pickedUp,
  deliveries.assigned,
];

export const deliveryHistory: Delivery[] = [
  deliveries.delivered,
  deliveries.failed,
  deliveries.cancelled,
  deliveries.delivered,
];

export const opsDeliveries: Delivery[] = [
  deliveries.delayed,
  deliveries.pending,
  deliveries.assigning,
  deliveries.onTheWay,
  deliveries.failed,
  deliveries.delivered,
  deliveries.longContent,
];

/** Offers shown on the courier's job-offer screen. */
export const courierOffers: Delivery[] = [
  makeDelivery({
    status: 'assigning',
    packageType: 'food',
    distanceKm: 3.2,
    estimatedDurationMinutes: 18,
    price: makePrice(42, 18),
    pickupAddress: addresses.storeNisantasi,
    dropoffAddress: addresses.homeKadikoy,
  }),
  makeDelivery({
    status: 'assigning',
    packageType: 'document',
    distanceKm: 6.7,
    estimatedDurationMinutes: 26,
    price: makePrice(52, 27),
  }),
];
