import { create } from 'zustand';
import { courierService } from '../services/courierService';
import { useQueueStore } from './queueStore';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { Courier, Delivery, DeliveryStatus } from '../types';

interface CourierState {
  profile: Courier | null;
  online: boolean;
  activeTask: Delivery | null;
  offers: Delivery[];
  loading: boolean;
  error?: string;

  restoreOnline: () => Promise<void>;
  setOnline: (online: boolean) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchOffers: () => Promise<void>;
  fetchActiveTask: () => Promise<void>;
  updateStatus: (id: string, status: DeliveryStatus) => Promise<void>;
}

export const useCourierStore = create<CourierState>((set) => ({
  profile: null,
  online: false,
  activeTask: null,
  offers: [],
  loading: false,
  error: undefined,

  restoreOnline: async () => {
    const online = await storage.get<boolean>(STORAGE_KEYS.courierOnline);
    set({ online: online ?? false });
  },

  setOnline: async (online) => {
    // İyimser güncelle; başarısızsa geri al.
    set({ online });
    await storage.set(STORAGE_KEYS.courierOnline, online);
    try {
      await courierService.setOnline(online);
    } catch (e) {
      set({ online: !online, error: e instanceof Error ? e.message : 'Durum değiştirilemedi' });
      await storage.set(STORAGE_KEYS.courierOnline, !online);
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ profile: await courierService.getProfile(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Profil yüklenemedi' });
    }
  },

  fetchOffers: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ offers: await courierService.getOffers(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Teklifler yüklenemedi' });
    }
  },

  fetchActiveTask: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ activeTask: await courierService.getActiveTask(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Görev yüklenemedi' });
    }
  },

  updateStatus: async (id, status) => {
    set({ error: undefined });
    // Kuyruk üzerinden: çevrimiçiyse hemen gönderilir, değilse sıraya alınır
    // (sinyalsiz bodrumda tamamlanan teslimat kaybolmaz).
    await useQueueStore.getState().submit(id, status);
  },
}));
