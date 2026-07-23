import { useCallback } from 'react';
import { useDeliveryStore } from '../stores/deliveryStore';
import { recentAddresses } from '../mocks/addresses';
import type { CreateDeliveryPayload } from '../services/deliveryService';
import type { Delivery } from '../types';

/**
 * Teslimat oluşturma akışının orkestrasyonu.
 *
 * Not: Alan girişleri (adres, paket, telefon) şimdilik CreateDeliveryScreen'in
 * içinde tutuluyor; bu hook async adımları (fiyat sorgusu + oluşturma) ve
 * durumlarını (loading/error) sahiplenir. Ekran form state'i dışarı açıldığında
 * (ileride) tüm alanlar buraya taşınır.
 */
const SAMPLE_PAYLOAD: CreateDeliveryPayload = {
  pickupAddress: recentAddresses[0],
  dropoffAddress: recentAddresses[1] ?? recentAddresses[0],
  packageType: 'small',
};

export function useCreateDeliveryForm() {
  const quote = useDeliveryStore((s) => s.quote);
  const resetQuote = useDeliveryStore((s) => s.resetQuote);
  const create = useDeliveryStore((s) => s.create);
  const price = useDeliveryStore((s) => s.price);
  const quoting = useDeliveryStore((s) => s.quoting);
  const quoteFailed = useDeliveryStore((s) => s.quoteFailed);
  const loading = useDeliveryStore((s) => s.loading);
  const error = useDeliveryStore((s) => s.error);

  const requestQuote = useCallback(() => quote(SAMPLE_PAYLOAD), [quote]);

  const submit = useCallback((): Promise<Delivery | null> => create(SAMPLE_PAYLOAD), [create]);

  return { requestQuote, resetQuote, submit, price, quoting, quoteFailed, loading, error };
}
