import { api } from '../utils/api';
import { deliveries, activeDeliveries, deliveryHistory } from '../mocks/deliveries';
import type { Delivery, PriceBreakdown, PackageTypeId, Address } from '../types';

const byId = (id: string): Delivery =>
  (deliveries as Record<string, Delivery>)[id] ?? deliveries.onTheWay;

export interface QuotePayload {
  pickupAddress: Address;
  dropoffAddress: Address;
  packageType: PackageTypeId;
}

export interface CreateDeliveryPayload extends QuotePayload {
  packageDescription?: string;
  scheduledAt?: string;
  /** Ödemenin alınacağı kayıtlı kart. */
  paymentCardId?: string;
}

export const deliveryService = {
  getActive: (signal?: AbortSignal) =>
    api.get<Delivery[]>('/deliveries/active', { signal, mock: () => activeDeliveries }),

  getHistory: (signal?: AbortSignal) =>
    api.get<Delivery[]>('/deliveries/history', { signal, mock: () => deliveryHistory }),

  getById: (id: string, signal?: AbortSignal) =>
    api.get<Delivery>(`/deliveries/${id}`, { signal, mock: () => byId(id) }),

  quote: (payload: QuotePayload) =>
    api.post<PriceBreakdown>('/deliveries/quote', {
      body: payload,
      mock: () => deliveries.onTheWay.price as PriceBreakdown,
    }),

  create: (payload: CreateDeliveryPayload) =>
    api.post<Delivery>('/deliveries', { body: payload, mock: () => deliveries.onTheWay }),

  cancel: (id: string) =>
    api.post<void>(`/deliveries/${id}/cancel`, { mock: () => undefined }),
};
