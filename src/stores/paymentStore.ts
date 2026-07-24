import { create } from 'zustand';
import { paymentService, type AddCardPayload } from '../services/paymentService';
import type { PaymentCard } from '../types';

interface PaymentState {
  cards: PaymentCard[];
  loading: boolean;
  saving: boolean;
  error?: string;

  fetchCards: () => Promise<void>;
  addCard: (payload: AddCardPayload) => Promise<PaymentCard | null>;
  removeCard: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  cards: [],
  loading: false,
  saving: false,
  error: undefined,

  fetchCards: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ cards: await paymentService.getCards(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Kartlar yüklenemedi' });
    }
  },

  addCard: async (payload) => {
    set({ saving: true, error: undefined });
    try {
      const created = await paymentService.addCard(payload);
      // Servis varsayılanı tek karta indirger; listeyi yeniden çek.
      set({ saving: false });
      await get().fetchCards();
      return created;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Kart eklenemedi' });
      return null;
    }
  },

  removeCard: async (id) => {
    const previous = get().cards;
    // İyimser: hemen çıkar, hata olursa geri al.
    set({ cards: previous.filter((c) => c.id !== id), error: undefined });
    try {
      await paymentService.removeCard(id);
      await get().fetchCards();
    } catch (e) {
      set({ cards: previous, error: e instanceof Error ? e.message : 'Kart silinemedi' });
    }
  },

  setDefault: async (id) => {
    const previous = get().cards;
    // İyimser: varsayılanı hemen taşı.
    set({ cards: previous.map((c) => ({ ...c, isDefault: c.id === id })), error: undefined });
    try {
      set({ cards: await paymentService.setDefault(id) });
    } catch (e) {
      set({ cards: previous, error: e instanceof Error ? e.message : 'Varsayılan değiştirilemedi' });
    }
  },
}));
