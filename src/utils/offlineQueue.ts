import type { DeliveryStatus } from '../types';

/**
 * Çevrimdışı durum güncelleme kuyruğunun SAF çekirdeği.
 *
 * Sinyalsiz bodrumda tamamlanan teslimat kaybolamaz: ağ yokken yapılan durum
 * güncellemeleri sıraya alınır, bağlantı gelince gönderilir. Buradaki fonksiyonlar
 * yan etkisiz — böylece node --test ile test edilebilir (RN bağımlılığı yok).
 * Kalıcılık/ağ dinleme queueStore'da.
 */

export interface QueuedUpdate {
  deliveryId: string;
  status: DeliveryStatus;
  /** Idempotency anahtarı — aynı teslimatın aynı durumu iki kez gitmesin. */
  key: string;
  attempts: number;
  createdAt: number;
}

/** deliveryId + status → tekil anahtar. */
export function makeKey(deliveryId: string, status: DeliveryStatus): string {
  return `${deliveryId}:${status}`;
}

/** Kuyruğa ekler; aynı anahtar zaten varsa kuyruğu değiştirmeden döner. */
export function enqueue(
  queue: QueuedUpdate[],
  update: { deliveryId: string; status: DeliveryStatus; createdAt: number },
): QueuedUpdate[] {
  const key = makeKey(update.deliveryId, update.status);
  if (queue.some((q) => q.key === key)) return queue;
  return [...queue, { ...update, key, attempts: 0 }];
}

/** Bir anahtarı kuyruktan çıkarır (başarılı gönderim sonrası). */
export function remove(queue: QueuedUpdate[], key: string): QueuedUpdate[] {
  return queue.filter((q) => q.key !== key);
}

/** Deneme sayısını artırır (başarısız gönderim sonrası). */
export function bumpAttempts(queue: QueuedUpdate[], key: string): QueuedUpdate[] {
  return queue.map((q) => (q.key === key ? { ...q, attempts: q.attempts + 1 } : q));
}

/** Üstel geri çekilme — 1s, 2s, 4s, ... en fazla 30s. */
export function backoffMs(attempts: number): number {
  return Math.min(30_000, 1_000 * 2 ** attempts);
}
