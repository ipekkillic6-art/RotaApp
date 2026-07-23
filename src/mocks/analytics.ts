import type {
  CourierPerformance,
  CustomerReview,
  EarningsPeriod,
  OpsMetrics,
} from '../types';

export const opsMetrics: OpsMetrics = {
  activeDeliveries: 38,
  pendingDeliveries: 12,
  availableCouriers: 9,
  delayedDeliveries: 4,
  failedDeliveries: 2,
  totalToday: 214,
  successRate: 0.968,
  averageDeliveryMinutes: 37,
};

/** A quiet start-of-day board — every counter near zero. */
export const opsMetricsEmpty: OpsMetrics = {
  activeDeliveries: 0,
  pendingDeliveries: 0,
  availableCouriers: 0,
  delayedDeliveries: 0,
  failedDeliveries: 0,
  totalToday: 0,
  successRate: 0,
  averageDeliveryMinutes: 0,
};

export const earnings = {
  today: {
    label: 'Bugün',
    amount: 842,
    deliveries: 11,
    bonus: 60,
    averagePerDelivery: 76.5,
  },
  week: {
    label: 'Bu hafta',
    amount: 4280,
    deliveries: 58,
    bonus: 340,
    averagePerDelivery: 73.8,
  },
  month: {
    label: 'Bu ay',
    amount: 17_940,
    deliveries: 241,
    bonus: 1120,
    averagePerDelivery: 74.4,
  },
} satisfies Record<string, EarningsPeriod>;

export const earningsPeriods: EarningsPeriod[] = [
  earnings.today,
  earnings.week,
  earnings.month,
];

/** Daily bars for the earnings chart mock. */
export const earningsByDay = [
  { label: 'Pzt', amount: 610 },
  { label: 'Sal', amount: 740 },
  { label: 'Çar', amount: 520 },
  { label: 'Per', amount: 880 },
  { label: 'Cum', amount: 690 },
  { label: 'Cmt', amount: 842 },
  { label: 'Paz', amount: 0 },
];

export const courierPerformance: CourierPerformance = {
  rating: 4.9,
  completionRate: 0.982,
  averageDeliveryMinutes: 34,
  cancellationRate: 0.018,
  onTimeRate: 0.941,
};

export const customerReviews: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Deniz A.',
    rating: 5,
    comment: 'Tahmini süreden önce geldi, paket kusursuzdu.',
    tags: ['Hızlı', 'Nazik'],
    createdAt: '2026-07-21T14:02:00+03:00',
  },
  {
    id: 'rev-2',
    customerName: 'Elif Ş.',
    rating: 4,
    tags: ['Zamanında'],
    createdAt: '2026-07-20T10:22:00+03:00',
  },
  {
    id: 'rev-3',
    customerName: 'Mert Ç.',
    rating: 3,
    comment:
      'Teslimat iyiydi ama kurye binanın arka girişini bulamadı, telefonda uzun süre tarif etmek zorunda kaldım. Adres notunun okunduğundan emin olun.',
    tags: ['Adres sorunu'],
    createdAt: '2026-07-19T17:48:00+03:00',
  },
];

/** Rating tags offered to the customer after delivery. */
export const RATING_TAGS = [
  'Hızlı',
  'Nazik',
  'Dikkatli taşıdı',
  'Zamanında',
  'İyi iletişim',
  'Temiz teslimat',
] as const;

/** Regional split for the ops analytics screen. */
export const regionBreakdown = [
  { region: 'Kadıköy', deliveries: 64, successRate: 0.98 },
  { region: 'Şişli', deliveries: 52, successRate: 0.96 },
  { region: 'Beşiktaş', deliveries: 41, successRate: 0.99 },
  { region: 'Üsküdar', deliveries: 33, successRate: 0.94 },
  { region: 'Tuzla', deliveries: 24, successRate: 0.88 },
];

export const cancellationReasons = [
  { reason: 'Alıcı adreste değil', count: 14 },
  { reason: 'Müşteri iptali', count: 9 },
  { reason: 'Adres hatalı', count: 6 },
  { reason: 'Kurye bulunamadı', count: 3 },
  { reason: 'Diğer', count: 2 },
];
