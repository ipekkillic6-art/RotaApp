import type { AppNotification, NotificationKind } from '../types';

const at = (time: string) => `2026-07-22T${time}:00+03:00`;

export const NOTIFICATION_COPY: Record<NotificationKind, { title: string; body: string }> = {
  courier_assigned: {
    title: 'Kurye atandı',
    body: 'Burak Y. teslimatını üstlendi, alış noktasına gidiyor.',
  },
  package_picked_up: {
    title: 'Paket alındı',
    body: 'Kurye paketi teslim aldı. Takip kodu: TR-2841',
  },
  courier_on_the_way: {
    title: 'Kurye yola çıktı',
    body: 'Teslimat adresine doğru yolda. Tahmini varış 14 dk.',
  },
  courier_nearby: {
    title: 'Kurye yaklaşıyor',
    body: 'Kurye 300 m uzakta. Teslimat kodunu hazırla.',
  },
  delivery_completed: {
    title: 'Teslimat tamamlandı',
    body: 'Paketin alıcıya teslim edildi. Deneyimini puanlar mısın?',
  },
  delivery_failed: {
    title: 'Teslimat başarısız',
    body: 'Alıcı adreste bulunamadı. Yeniden planlamak ister misin?',
  },
  new_task: {
    title: 'Yeni görev',
    body: 'Şişli → Kadıköy · 11,4 km · 93 ₺ · 42 dk',
  },
  task_cancelled: {
    title: 'Görev iptal edildi',
    body: 'TR-2845 numaralı görev müşteri tarafından iptal edildi.',
  },
  payment_completed: {
    title: 'Ödeme tamamlandı',
    body: 'Haftalık kazancın 4.280 ₺ hesabına aktarıldı.',
  },
  ops_alert: {
    title: 'Operasyon uyarısı',
    body: 'Kadıköy bölgesinde 4 teslimat 20 dk’dan fazla gecikti.',
  },
};

let n = 0;
const make = (
  kind: NotificationKind,
  overrides: Partial<AppNotification> = {},
): AppNotification => ({
  id: `ntf-${++n}`,
  kind,
  ...NOTIFICATION_COPY[kind],
  createdAt: at('10:12'),
  read: false,
  ...overrides,
});

export const notifications = {
  unread: make('courier_nearby'),
  read: make('package_picked_up', { read: true, createdAt: at('09:31') }),
  critical: make('delivery_failed', { critical: true, createdAt: at('11:04') }),
  opsAlert: make('ops_alert', { critical: true, createdAt: at('11:22') }),
  newTask: make('new_task'),
  payment: make('payment_completed', { read: true, createdAt: at('08:00') }),
} satisfies Record<string, AppNotification>;

export const customerNotifications: AppNotification[] = [
  notifications.unread,
  make('courier_on_the_way', { createdAt: at('10:02') }),
  notifications.read,
  make('courier_assigned', { read: true, createdAt: at('09:08') }),
  make('delivery_completed', { read: true, createdAt: at('08:44') }),
];

export const courierNotifications: AppNotification[] = [
  notifications.newTask,
  make('task_cancelled', { critical: true, createdAt: at('10:40') }),
  notifications.payment,
];

export const opsNotifications: AppNotification[] = [
  notifications.opsAlert,
  notifications.critical,
  make('ops_alert', {
    body: 'Tuzla bölgesinde müsait kurye kalmadı.',
    createdAt: at('11:18'),
  }),
];

/** Edge case: an inbox long enough to need virtualisation thinking. */
export const manyNotifications: AppNotification[] = Array.from({ length: 40 }, (_, i) =>
  make(
    (['courier_nearby', 'new_task', 'delivery_completed', 'ops_alert'] as const)[i % 4],
    {
      id: `ntf-bulk-${i}`,
      read: i > 6,
      critical: i % 11 === 0,
      createdAt: at(`${String(8 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`),
    },
  ),
);
