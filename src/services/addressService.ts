import { api } from '../utils/api';
import { savedAddresses, recentAddresses, addressSuggestions } from '../mocks/addresses';
import type { Address } from '../types';

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
};
