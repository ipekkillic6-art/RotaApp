import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

import { courierService } from '../services/courierService';
import { storage, STORAGE_KEYS } from '../utils/storage';
import {
  enqueue,
  remove,
  bumpAttempts,
  backoffMs,
  type QueuedUpdate,
} from '../utils/offlineQueue';
import type { DeliveryStatus } from '../types';

interface QueueState {
  items: QueuedUpdate[];
  count: number;
  online: boolean;
  processing: boolean;

  /** App açılışında: kuyruğu yükle + ağ dinleyicisini kur. */
  init: () => Promise<void>;
  /** Durum güncellemesi gönder — çevrimiçiyse hemen, değilse sıraya al. */
  submit: (deliveryId: string, status: DeliveryStatus) => Promise<void>;
  /** Kuyruğu sırayla göndermeyi dener. */
  flush: () => Promise<void>;
}

let retryTimer: ReturnType<typeof setTimeout> | null = null;

export const useQueueStore = create<QueueState>((set, get) => {
  const persist = (items: QueuedUpdate[]) => {
    set({ items, count: items.length });
    return storage.set(STORAGE_KEYS.offlineQueue, items);
  };

  return {
    items: [],
    count: 0,
    online: true,
    processing: false,

    init: async () => {
      const saved = (await storage.get<QueuedUpdate[]>(STORAGE_KEYS.offlineQueue)) ?? [];
      set({ items: saved, count: saved.length });

      NetInfo.addEventListener((state) => {
        const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
        const wasOffline = !get().online;
        set({ online });
        // Bağlantı geri geldi → bekleyenleri gönder.
        if (online && wasOffline && get().items.length > 0) {
          get().flush();
        }
      });

      if (get().online && saved.length > 0) get().flush();
    },

    submit: async (deliveryId, status) => {
      if (!get().online) {
        await persist(enqueue(get().items, { deliveryId, status, createdAt: Date.now() }));
        return;
      }
      try {
        await courierService.updateStatus(deliveryId, status);
      } catch {
        // Çevrimiçi ama gönderim başarısız → sıraya al, geri çekilmeyle tekrar dene.
        await persist(enqueue(get().items, { deliveryId, status, createdAt: Date.now() }));
        get().flush();
      }
    },

    flush: async () => {
      if (get().processing || !get().online) return;
      set({ processing: true });
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      try {
        // Kuyruğun anlık kopyası üzerinde sırayla ilerle.
        for (const item of [...get().items]) {
          if (!get().online) break;
          try {
            await courierService.updateStatus(item.deliveryId, item.status);
            await persist(remove(get().items, item.key));
          } catch {
            const bumped = bumpAttempts(get().items, item.key);
            await persist(bumped);
            const attempts = bumped.find((q) => q.key === item.key)?.attempts ?? 1;
            // Üstel geri çekilmeyle yeniden dene.
            retryTimer = setTimeout(() => get().flush(), backoffMs(attempts));
            break;
          }
        }
      } finally {
        set({ processing: false });
      }
    },
  };
});
