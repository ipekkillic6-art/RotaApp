import { api } from '../utils/api';
import { savedAddresses, recentAddresses, addressSuggestions } from '../mocks/addresses';
import type { Address } from '../types';

/** Yeni adres oluşturma gövdesi — id sunucuda (mock'ta) atanır. */
export interface CreateAddressPayload {
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  /** Haritadan/GPS'ten seçilen tam nokta — kurye buraya yönlendirilir. */
  latitude?: number;
  longitude?: number;
}

export const addressService = {
  getSaved: (signal?: AbortSignal) =>
    api.get<Address[]>('/addresses/saved', { signal, mock: () => savedAddresses }),

  getRecent: (signal?: AbortSignal) =>
    api.get<Address[]>('/addresses/recent', { signal, mock: () => recentAddresses }),

  search: (query: string, signal?: AbortSignal) =>
    api.get<Address[]>(`/addresses/search?q=${encodeURIComponent(query)}`, {
      signal,
      mock: () => {
        const q = query.toLowerCase();
        return addressSuggestions.filter(
          (a) =>
            a.title.toLowerCase().includes(q) || a.fullAddress.toLowerCase().includes(q),
        );
      },
    }),

  /** Koordinattan adres (Faz 6.2'de gerçek reverse geocode). */
  reverseGeocode: (lat: number, lng: number) =>
    api.get<Address>(`/addresses/reverse?lat=${lat}&lng=${lng}`, {
      mock: () => recentAddresses[0],
    }),

  /** Yeni adres kaydet. Mock: id atar ve kayıtlı listenin başına ekler. */
  create: (payload: CreateAddressPayload, signal?: AbortSignal) =>
    api.post<Address>('/addresses', {
      body: payload,
      signal,
      mock: () => {
        const created: Address = { id: `adr-${Date.now()}`, ...payload };
        savedAddresses.unshift(created);
        return created;
      },
    }),

  /** Mevcut adresi güncelle. Mock: kayıtlı listede yerinde değiştirir. */
  update: (id: string, payload: CreateAddressPayload, signal?: AbortSignal) =>
    api.put<Address>(`/addresses/${id}`, {
      body: payload,
      signal,
      mock: () => {
        const updated: Address = { id, ...payload };
        const i = savedAddresses.findIndex((a) => a.id === id);
        if (i >= 0) savedAddresses[i] = updated;
        return updated;
      },
    }),

  /** Adresi sil. Mock: kayıtlı listeden çıkarır. */
  remove: (id: string, signal?: AbortSignal) =>
    api.delete<void>(`/addresses/${id}`, {
      signal,
      mock: () => {
        const i = savedAddresses.findIndex((a) => a.id === id);
        if (i >= 0) savedAddresses.splice(i, 1);
      },
    }),
};
