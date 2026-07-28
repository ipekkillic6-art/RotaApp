import { useCallback, useEffect, useMemo } from 'react';
import { create as createStore } from 'zustand';
import { useDeliveryStore } from '../stores/deliveryStore';
import { usePaymentStore } from '../stores/paymentStore';
import { savedAddresses } from '../mocks/addresses';
import {
  INITIAL_FORM,
  canProceedForStep,
  type CreateDeliveryForm,
} from '../utils/createDeliveryValidation';
import type { CreateDeliveryPayload } from '../services/deliveryService';
import type { Address, Delivery } from '../types';
import type { CreateStepKey } from '../screens/customer/CreateDeliveryScreen';

export type { CreateDeliveryForm };

/**
 * Form state modül seviyesi store'da — adımlar arası `navigation.replace`
 * ekranı yeniden mount ettiğinde veri KAYBOLMASIN diye (useState olmaz).
 */
interface CreateFormState {
  form: CreateDeliveryForm;
  update: (patch: Partial<CreateDeliveryForm>) => void;
  reset: () => void;
}
const useCreateFormStore = createStore<CreateFormState>((set) => ({
  form: INITIAL_FORM,
  update: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  reset: () => set({ form: INITIAL_FORM }),
}));

export function useCreateDeliveryForm() {
  const form = useCreateFormStore((s) => s.form);
  const update = useCreateFormStore((s) => s.update);
  const reset = useCreateFormStore((s) => s.reset);
  const quote = useDeliveryStore((s) => s.quote);
  const create = useDeliveryStore((s) => s.create);
  const cards = usePaymentStore((s) => s.cards);
  const fetchCards = usePaymentStore((s) => s.fetchCards);

  // Kartları yükle ve varsayılan kartı otomatik seç (kullanıcı hiç seçmediyse).
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);
  useEffect(() => {
    if (!form.paymentCardId && cards.length > 0) {
      update({ paymentCardId: (cards.find((c) => c.isDefault) ?? cards[0]).id });
    }
  }, [cards, form.paymentCardId, update]);
  const price = useDeliveryStore((s) => s.price);
  const quoteDistanceKm = useDeliveryStore((s) => s.quoteDistanceKm);
  const quoting = useDeliveryStore((s) => s.quoting);
  const quoteFailed = useDeliveryStore((s) => s.quoteFailed);
  const loading = useDeliveryStore((s) => s.loading);
  const error = useDeliveryStore((s) => s.error);

  const findAddress = useCallback(
    (id: string | null): Address | undefined => savedAddresses.find((a) => a.id === id),
    [],
  );

  /** Adım geçerli mi — saf doğrulama modülünü kullanır. */
  const canProceed = useCallback(
    (step: CreateStepKey): boolean => canProceedForStep(step, form, { quoting, quoteFailed }),
    [form, quoting, quoteFailed],
  );

  const payload = useMemo<CreateDeliveryPayload | null>(() => {
    const pickup = findAddress(form.pickupAddressId);
    const dropoff = findAddress(form.dropoffAddressId);
    if (!pickup || !dropoff) return null;
    return {
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      packageType: form.packageType,
      speed: form.speed,
      packageDescription: form.packageNote.trim() || undefined,
      paymentCardId: form.paymentCardId ?? undefined,
    };
  }, [form, findAddress]);

  const requestQuote = useCallback(() => {
    if (payload) quote(payload);
  }, [payload, quote]);

  const submit = useCallback((): Promise<Delivery | null> => {
    if (!payload) return Promise.resolve(null);
    return create(payload);
  }, [payload, create]);

  return {
    form,
    update,
    reset,
    canProceed,
    findAddress,
    savedAddresses,
    savedCards: cards,
    requestQuote,
    submit,
    price,
    quoteDistanceKm,
    quoting,
    quoteFailed,
    loading,
    error,
  };
}
