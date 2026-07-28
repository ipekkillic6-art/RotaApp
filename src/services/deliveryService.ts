import { api } from '../utils/api';
import { deliveries, activeDeliveries, deliveryHistory } from '../mocks/deliveries';
import { currentMembership } from './membershipService';
import { hasActiveBenefits } from '../utils/membership';
import { quotePrice } from '../utils/pricing';
import type {
  Delivery,
  DeliverySpeed,
  PriceBreakdown,
  PackageTypeId,
  Address,
} from '../types';

const byId = (id: string): Delivery =>
  (deliveries as Record<string, Delivery>)[id] ?? deliveries.onTheWay;

/**
 * Mock mesafe.
 *
 * Adreslerin koordinatı her zaman dolu olmadığı için rota mesafesi burada
 * sabit. Gerçek backend bunu haritadan hesaplar; ekrandaki "11,4 km için"
 * satırı da bu sabitten beslenir ki fiyat ile açıklama tutarlı olsun.
 */
export const MOCK_DISTANCE_KM = 11.4;

export interface QuotePayload {
  pickupAddress: Address;
  dropoffAddress: Address;
  packageType: PackageTypeId;
  speed: DeliverySpeed;
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
      mock: () =>
        quotePrice({
          distanceKm: MOCK_DISTANCE_KM,
          packageType: payload.packageType,
          speed: payload.speed,
          // Hak ediş sunucuda çözülür — istemci indirim isteyemez.
          membershipActive: hasActiveBenefits(currentMembership(), new Date()),
        }),
    }),

  create: (payload: CreateDeliveryPayload) =>
    api.post<Delivery>('/deliveries', { body: payload, mock: () => deliveries.onTheWay }),

  cancel: (id: string) =>
    api.post<void>(`/deliveries/${id}/cancel`, { mock: () => undefined }),
};
