import type { Courier } from '../types';

/**
 * Courier fixtures.
 *
 * Includes the two cases that break naive layouts: a courier with no avatar
 * (initials fallback) and a very long full name.
 */

export const couriers = {
  burak: {
    id: 'crr-01',
    fullName: 'Burak Yılmaz',
    avatarUrl: 'https://i.pravatar.cc/160?img=12',
    rating: 4.9,
    vehicleType: 'motorcycle',
    status: 'busy',
    completedDeliveries: 1284,
    todayDeliveries: 11,
    activeTaskCount: 1,
    phone: '+90 530 441 08 25',
    distanceKm: 1.2,
    etaMinutes: 6,
  },
  selin: {
    id: 'crr-02',
    fullName: 'Selin Aksoy',
    avatarUrl: 'https://i.pravatar.cc/160?img=45',
    rating: 4.8,
    vehicleType: 'motorcycle',
    status: 'available',
    completedDeliveries: 903,
    todayDeliveries: 7,
    activeTaskCount: 0,
    phone: '+90 542 330 77 61',
    distanceKm: 0.8,
    etaMinutes: 4,
  },
  /** No avatar — exercises the initials fallback. */
  hakan: {
    id: 'crr-03',
    fullName: 'Hakan Demir',
    rating: 4.6,
    vehicleType: 'car',
    status: 'available',
    completedDeliveries: 412,
    todayDeliveries: 4,
    activeTaskCount: 0,
    phone: '+90 536 118 40 92',
    distanceKm: 3.4,
    etaMinutes: 12,
  },
  ayse: {
    id: 'crr-04',
    fullName: 'Ayşe Korkmaz',
    avatarUrl: 'https://i.pravatar.cc/160?img=32',
    rating: 5.0,
    vehicleType: 'bicycle',
    status: 'busy',
    completedDeliveries: 2140,
    todayDeliveries: 14,
    activeTaskCount: 2,
    phone: '+90 555 902 13 77',
    distanceKm: 2.1,
    etaMinutes: 9,
  },
  emre: {
    id: 'crr-05',
    fullName: 'Emre Öztürk',
    avatarUrl: 'https://i.pravatar.cc/160?img=68',
    rating: 4.2,
    vehicleType: 'motorcycle',
    status: 'offline',
    completedDeliveries: 188,
    todayDeliveries: 0,
    activeTaskCount: 0,
    phone: '+90 538 664 20 15',
  },
  /** Edge case: long name, low rating, suspended. */
  longName: {
    id: 'crr-06',
    fullName: 'Abdurrahman Hüseyinoğlu Karaağaçlıoğlu',
    rating: 3.4,
    vehicleType: 'walking',
    status: 'suspended',
    completedDeliveries: 27,
    todayDeliveries: 0,
    activeTaskCount: 0,
  },
} satisfies Record<string, Courier>;

export const courierList: Courier[] = Object.values(couriers);

export const availableCouriers: Courier[] = courierList
  .filter((c) => c.status === 'available')
  .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));

/** Assignment candidates — includes busy couriers so ops can weigh the trade-off. */
export const assignmentCandidates: Courier[] = [
  couriers.selin,
  couriers.hakan,
  couriers.burak,
  couriers.ayse,
];
