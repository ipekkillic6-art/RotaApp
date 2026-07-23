import { deliveries, deliveryHistory, courierOffers } from '../mocks/deliveries';
import type { Delivery } from '../types';

/**
 * Container'ların ortak veri yardımcıları. Backend gelene kadar (Faz 4-5)
 * ekranlar mock'tan beslenir. keyFor referans eşitliğiyle çalışır — ekranlar
 * aynı mock nesnesini geri verir.
 */

/** Rota param'ındaki id'den fixture'ı çözer. */
export const byId = (id: string): Delivery =>
  (deliveries as Record<string, Delivery>)[id] ?? deliveries.onTheWay;

/** Bir teslimat nesnesini fixture anahtarına geri eşler (rota param'ı için). */
export function keyFor(delivery: Delivery): string {
  const entry = Object.entries(deliveries as Record<string, Delivery>).find(
    ([, d]) => d === delivery,
  );
  return entry?.[0] ?? 'onTheWay';
}

/** Kurye görev listesi grupları. */
export const COURIER_TASKS = {
  new: courierOffers,
  active: [deliveries.pickedUp, deliveries.onTheWay],
  done: deliveryHistory.filter((d) => d.status === 'delivered'),
  rejected: [] as Delivery[],
};
