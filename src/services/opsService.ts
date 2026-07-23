import { api } from '../utils/api';
import { deliveries, opsDeliveries } from '../mocks/deliveries';
import { courierList, assignmentCandidates } from '../mocks/couriers';
import { opsMetrics, regionBreakdown, cancellationReasons } from '../mocks/analytics';
import type { Courier, Delivery, OpsMetrics } from '../types';

export interface OpsDeliveryFilter {
  query?: string;
  status?: string;
  page?: number;
}

const byId = (id: string): Delivery =>
  (deliveries as Record<string, Delivery>)[id] ?? deliveries.onTheWay;

export const opsService = {
  getMetrics: (signal?: AbortSignal) =>
    api.get<OpsMetrics>('/ops/metrics', { signal, mock: () => opsMetrics }),

  getDeliveries: (filter: OpsDeliveryFilter = {}, signal?: AbortSignal) =>
    api.get<Delivery[]>('/ops/deliveries', {
      signal,
      // Sunucu tarafı filtre; mock modda basit istemci filtresi.
      mock: () =>
        opsDeliveries.filter((d) =>
          filter.query
            ? d.trackingNumber.toLowerCase().includes(filter.query.toLowerCase())
            : true,
        ),
    }),

  getDeliveryById: (id: string, signal?: AbortSignal) =>
    api.get<Delivery>(`/ops/deliveries/${id}`, { signal, mock: () => byId(id) }),

  getCourierList: (signal?: AbortSignal) =>
    api.get<Courier[]>('/ops/couriers', { signal, mock: () => courierList }),

  getAssignmentCandidates: (deliveryId: string, signal?: AbortSignal) =>
    api.get<Courier[]>(`/ops/deliveries/${deliveryId}/candidates`, {
      signal,
      mock: () => assignmentCandidates,
    }),

  assignCourier: (deliveryId: string, courierId: string) =>
    api.post<void>(`/ops/deliveries/${deliveryId}/assign`, {
      body: { courierId },
      mock: () => undefined,
    }),

  cancelDelivery: (deliveryId: string, reason?: string) =>
    api.post<void>(`/ops/deliveries/${deliveryId}/cancel`, {
      body: { reason },
      mock: () => undefined,
    }),

  getAnalytics: (signal?: AbortSignal) =>
    api.get('/ops/analytics', {
      signal,
      mock: () => ({ metrics: opsMetrics, regions: regionBreakdown, cancellations: cancellationReasons }),
    }),
};
