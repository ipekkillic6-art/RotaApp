import { api } from '../utils/api';
import { deliveries, courierOffers } from '../mocks/deliveries';
import { couriers } from '../mocks/couriers';
import { earnings, earningsPeriods, earningsByDay, courierPerformance, customerReviews } from '../mocks/analytics';
import type { Courier, Delivery, DeliveryStatus } from '../types';

export const courierService = {
  getProfile: (signal?: AbortSignal) =>
    api.get<Courier>('/courier/me', { signal, mock: () => couriers.burak }),

  setOnline: (online: boolean) =>
    api.post<void>('/courier/online', { body: { online }, mock: () => undefined }),

  getActiveTask: (signal?: AbortSignal) =>
    api.get<Delivery | null>('/courier/active-task', { signal, mock: () => deliveries.onTheWay }),

  getOffers: (signal?: AbortSignal) =>
    api.get<Delivery[]>('/courier/offers', { signal, mock: () => courierOffers }),

  acceptOffer: (id: string) =>
    api.post<Delivery>(`/courier/offers/${id}/accept`, { mock: () => deliveries.onTheWay }),

  rejectOffer: (id: string) =>
    api.post<void>(`/courier/offers/${id}/reject`, { mock: () => undefined }),

  updateStatus: (id: string, status: DeliveryStatus) =>
    api.patch<void>(`/deliveries/${id}/status`, { body: { status }, mock: () => undefined }),

  getEarnings: (signal?: AbortSignal) =>
    api.get('/courier/earnings', {
      signal,
      mock: () => ({ summary: earnings, periods: earningsPeriods, byDay: earningsByDay }),
    }),

  getPerformance: (signal?: AbortSignal) =>
    api.get('/courier/performance', {
      signal,
      mock: () => ({ performance: courierPerformance, reviews: customerReviews }),
    }),
};
