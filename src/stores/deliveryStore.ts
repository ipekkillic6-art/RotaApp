import { create } from 'zustand';
import {
  deliveryService,
  MOCK_DISTANCE_KM,
  type CreateDeliveryPayload,
  type QuotePayload,
} from '../services/deliveryService';
import type { Delivery, PriceBreakdown } from '../types';

interface DeliveryState {
  active: Delivery[];
  history: Delivery[];
  current: Delivery | null;
  loading: boolean;
  error?: string;

  // Teslimat oluşturma — fiyat adımı
  price: PriceBreakdown | null;
  /** Fiyatın hesaplandığı mesafe — özet satırındaki "11,4 km için" bundan gelir. */
  quoteDistanceKm: number | null;
  quoting: boolean;
  quoteFailed: boolean;

  fetchActive: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  quote: (payload: QuotePayload) => Promise<void>;
  resetQuote: () => void;
  create: (payload: CreateDeliveryPayload) => Promise<Delivery | null>;
  cancel: (id: string) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  active: [],
  history: [],
  current: null,
  loading: false,
  error: undefined,
  price: null,
  quoteDistanceKm: null,
  quoting: false,
  quoteFailed: false,

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

  quote: async (payload) => {
    set({ quoting: true, quoteFailed: false });
    try {
      set({
        price: await deliveryService.quote(payload),
        quoteDistanceKm: MOCK_DISTANCE_KM,
        quoting: false,
      });
    } catch {
      set({ quoting: false, quoteFailed: true });
    }
  },

  resetQuote: () =>
    set({ price: null, quoteDistanceKm: null, quoting: false, quoteFailed: false }),

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
