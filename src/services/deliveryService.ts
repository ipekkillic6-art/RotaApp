import { api } from '../utils/api';
import { deliveries, activeDeliveries, deliveryHistory } from '../mocks/deliveries';
import { currentMembership } from './membershipService';
import { estimatedRoadDistanceKm } from '../utils/geo';
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
 * Adreslerin koordinatı yoksa kullanılan yedek mesafe.
 *
 * Koordinat varsa mesafe gerçekten hesaplanır (bkz. `estimatedRoadDistanceKm`).
 * Elle girilmiş, hiç haritadan seçilmemiş adreslerde koordinat olmayabilir.
 */
export const FALLBACK_DISTANCE_KM = 11.4;

export interface QuotePayload {
  pickupAddress: Address;
  dropoffAddress: Address;
  packageType: PackageTypeId;
  speed: DeliverySpeed;
}

/**
 * Teklif yanıtı.
 *
 * Fiyatın yanında hesabın dayandığı mesafe de döner — ekrandaki
 * "Mesafe ücreti · 11,4 km" satırı ile ücret aynı kaynaktan beslensin.
 */
export interface DeliveryQuote {
  price: PriceBreakdown;
  distanceKm: number;
}

export interface CreateDeliveryPayload extends QuotePayload {
  packageDescription?: string;
  scheduledAt?: string;
  /** Ödemenin alınacağı kayıtlı kart. */
  paymentCardId?: string;
  /** Gönderenin telefonu — kurye alış sırasında bu numaradan arar. */
  senderPhone?: string;
  /** Teslim alacak kişi. Adres defterindeki kişiden farklı olabilir. */
  recipientName?: string;
  /** Teslimat kodu bu numaraya gider; kurye teslimatta bu numarayı arar. */
  recipientPhone?: string;
}

export const deliveryService = {
  getActive: (signal?: AbortSignal) =>
    api.get<Delivery[]>('/deliveries/active', { signal, mock: () => activeDeliveries }),

  getHistory: (signal?: AbortSignal) =>
    api.get<Delivery[]>('/deliveries/history', { signal, mock: () => deliveryHistory }),

  getById: (id: string, signal?: AbortSignal) =>
    api.get<Delivery>(`/deliveries/${id}`, { signal, mock: () => byId(id) }),

  quote: (payload: QuotePayload) =>
    api.post<DeliveryQuote>('/deliveries/quote', {
      body: payload,
      mock: () => {
        // Adreslerin koordinatı varsa mesafe gerçekten hesaplanır; yoksa
        // (elle girilmiş adres) yedeğe düşülür.
        const distanceKm =
          estimatedRoadDistanceKm(payload.pickupAddress, payload.dropoffAddress) ??
          FALLBACK_DISTANCE_KM;
        return {
          distanceKm,
          price: quotePrice({
            distanceKm,
            packageType: payload.packageType,
            speed: payload.speed,
            // Hak ediş sunucuda çözülür — istemci indirim isteyemez.
            membershipActive: hasActiveBenefits(currentMembership(), new Date()),
          }),
        };
      },
    }),

  create: (payload: CreateDeliveryPayload) =>
    api.post<Delivery>('/deliveries', {
      body: payload,
      mock: () => {
        // Akışta girilen alıcı, adres defterindeki kişiden farklı olabilir.
        // Teslimat adresine yansıtılır ki kurye DOĞRU kişiyi arasın ve
        // teslimat kodu doğru numaraya gitsin.
        const base = deliveries.onTheWay;
        return {
          ...base,
          speed: payload.speed,
          packageType: payload.packageType,
          packageDescription: payload.packageDescription ?? base.packageDescription,
          scheduledAt: payload.scheduledAt ?? base.scheduledAt,
          pickupAddress: {
            ...payload.pickupAddress,
            contactPhone: payload.senderPhone?.trim() || payload.pickupAddress.contactPhone,
          },
          dropoffAddress: {
            ...payload.dropoffAddress,
            contactName: payload.recipientName?.trim() || payload.dropoffAddress.contactName,
            contactPhone: payload.recipientPhone?.trim() || payload.dropoffAddress.contactPhone,
          },
        };
      },
    }),

  cancel: (id: string) =>
    api.post<void>(`/deliveries/${id}/cancel`, { mock: () => undefined }),
};
