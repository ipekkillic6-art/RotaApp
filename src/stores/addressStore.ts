import { create } from 'zustand';
import { addressService, type CreateAddressPayload } from '../services/addressService';
import type { Address } from '../types';

interface AddressState {
  saved: Address[];
  loading: boolean;
  saving: boolean;
  removing: boolean;
  error?: string;
  /** Haritadan seçilen konum — form ekranı okuyup temizler (ekranlar arası köprü). */
  pickedLocation?: Address;

  fetchSaved: () => Promise<void>;
  add: (payload: CreateAddressPayload) => Promise<Address | null>;
  update: (id: string, payload: CreateAddressPayload) => Promise<Address | null>;
  remove: (id: string) => Promise<boolean>;
  setPickedLocation: (address: Address) => void;
  clearPickedLocation: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  saved: [],
  loading: false,
  saving: false,
  removing: false,
  error: undefined,
  pickedLocation: undefined,

  setPickedLocation: (address) => set({ pickedLocation: address }),
  clearPickedLocation: () => set({ pickedLocation: undefined }),

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

  update: async (id, payload) => {
    set({ saving: true, error: undefined });
    try {
      const updated = await addressService.update(id, payload);
      set((s) => ({ saving: false, saved: s.saved.map((a) => (a.id === id ? updated : a)) }));
      return updated;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Adres güncellenemedi' });
      return null;
    }
  },

  remove: async (id) => {
    set({ removing: true, error: undefined });
    try {
      await addressService.remove(id);
      set((s) => ({ removing: false, saved: s.saved.filter((a) => a.id !== id) }));
      return true;
    } catch (e) {
      set({ removing: false, error: e instanceof Error ? e.message : 'Adres silinemedi' });
      return false;
    }
  },
}));
