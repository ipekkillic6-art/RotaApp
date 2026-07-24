import { create } from 'zustand';
import { addressService, type CreateAddressPayload } from '../services/addressService';
import type { Address } from '../types';

interface AddressState {
  saved: Address[];
  loading: boolean;
  saving: boolean;
  error?: string;

  fetchSaved: () => Promise<void>;
  add: (payload: CreateAddressPayload) => Promise<Address | null>;
}

export const useAddressStore = create<AddressState>((set) => ({
  saved: [],
  loading: false,
  saving: false,
  error: undefined,

  fetchSaved: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ saved: await addressService.getSaved(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Adresler yüklenemedi' });
    }
  },

  add: async (payload) => {
    set({ saving: true, error: undefined });
    try {
      const created = await addressService.create(payload);
      // Yeni adres listenin başına — kullanıcı eklediğini hemen görsün.
      set((s) => ({
        saving: false,
        saved: [created, ...s.saved.filter((a) => a.id !== created.id)],
      }));
      return created;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Adres kaydedilemedi' });
      return null;
    }
  },
}));
