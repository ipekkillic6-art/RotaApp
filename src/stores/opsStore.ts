import { create } from 'zustand';
import { opsService, type OpsDeliveryFilter } from '../services/opsService';
import type { Courier, Delivery, OpsMetrics } from '../types';

interface OpsState {
  metrics: OpsMetrics | null;
  deliveries: Delivery[];
  couriers: Courier[];
  filter: OpsDeliveryFilter;
  loading: boolean;
  error?: string;

  fetchMetrics: () => Promise<void>;
  fetchDeliveries: (filter?: OpsDeliveryFilter) => Promise<void>;
  fetchCouriers: () => Promise<void>;
  assign: (deliveryId: string, courierId: string) => Promise<void>;
  cancelDelivery: (deliveryId: string, reason?: string) => Promise<void>;
}

export const useOpsStore = create<OpsState>((set, get) => ({
  metrics: null,
  deliveries: [],
  couriers: [],
  filter: {},
  loading: false,
  error: undefined,

  fetchMetrics: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ metrics: await opsService.getMetrics(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Metrikler yüklenemedi' });
    }
  },

  fetchDeliveries: async (filter) => {
    const nextFilter = filter ?? get().filter;
    set({ loading: true, error: undefined, filter: nextFilter });
    try {
      set({ deliveries: await opsService.getDeliveries(nextFilter), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Teslimatlar yüklenemedi' });
    }
  },

  fetchCouriers: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ couriers: await opsService.getCourierList(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Kuryeler yüklenemedi' });
    }
  },

  assign: async (deliveryId, courierId) => {
    set({ error: undefined });
    try {
      await opsService.assignCourier(deliveryId, courierId);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Atama başarısız' });
    }
  },

  cancelDelivery: async (deliveryId, reason) => {
    set({ error: undefined });
    try {
      await opsService.cancelDelivery(deliveryId, reason);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'İptal başarısız' });
    }
  },
}));
