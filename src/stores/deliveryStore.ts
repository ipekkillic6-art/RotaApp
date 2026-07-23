import { create } from 'zustand';
import { deliveryService, type CreateDeliveryPayload } from '../services/deliveryService';
import type { Delivery } from '../types';

interface DeliveryState {
  active: Delivery[];
  history: Delivery[];
  current: Delivery | null;
  loading: boolean;
  error?: string;

  fetchActive: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (payload: CreateDeliveryPayload) => Promise<Delivery | null>;
  cancel: (id: string) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  active: [],
  history: [],
  current: null,
  loading: false,
  error: undefined,

  fetchActive: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ active: await deliveryService.getActive(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Teslimatlar yüklenemedi' });
    }
  },

  fetchHistory: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ history: await deliveryService.getHistory(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Geçmiş yüklenemedi' });
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: undefined });
    try {
      set({ current: await deliveryService.getById(id), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Teslimat yüklenemedi' });
    }
  },

  create: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const created = await deliveryService.create(payload);
      set({ loading: false });
      return created;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Teslimat oluşturulamadı' });
      return null;
    }
  },

  cancel: async (id) => {
    set({ loading: true, error: undefined });
    try {
      await deliveryService.cancel(id);
      set((s) => ({ loading: false, active: s.active.filter((d) => d.id !== id) }));
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'İptal edilemedi' });
    }
  },
}));
