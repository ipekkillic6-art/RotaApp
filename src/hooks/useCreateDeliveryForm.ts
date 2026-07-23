import { useCallback, useMemo } from 'react';
import { create as createStore } from 'zustand';
import { useDeliveryStore } from '../stores/deliveryStore';
import { savedAddresses } from '../mocks/addresses';
import type { CreateDeliveryPayload } from '../services/deliveryService';
import type { Address, Delivery, PackageTypeId } from '../types';
import type { CreateStepKey } from '../screens/customer/CreateDeliveryScreen';

/**
 * Teslimat oluşturma formunun TÜM verisi, doğrulaması ve "sonraki adıma
 * geçebilir mi" kararı burada — ekran saf/kontrollü kalır (roadmap 5.2).
 */
export interface CreateDeliveryForm {
  pickupAddressId: string | null;
  dropoffAddressId: string | null;
  packageType: PackageTypeId;
  packageNote: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  timing: 'now' | 'scheduled';
}

const INITIAL: CreateDeliveryForm = {
  pickupAddressId: null,
  dropoffAddressId: null,
  packageType: 'small',
  packageNote: '',
  senderPhone: '532 114 22 07',
  recipientName: '',
  recipientPhone: '',
  timing: 'now',
};

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
  form: INITIAL,
  update: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  reset: () => set({ form: INITIAL }),
}));

export function useCreateDeliveryForm() {
  const form = useCreateFormStore((s) => s.form);
  const update = useCreateFormStore((s) => s.update);
  const reset = useCreateFormStore((s) => s.reset);
  const quote = useDeliveryStore((s) => s.quote);
  const create = useDeliveryStore((s) => s.create);
  const price = useDeliveryStore((s) => s.price);
  const quoting = useDeliveryStore((s) => s.quoting);
  const quoteFailed = useDeliveryStore((s) => s.quoteFailed);
  const loading = useDeliveryStore((s) => s.loading);
  const error = useDeliveryStore((s) => s.error);

  const findAddress = useCallback(
    (id: string | null): Address | undefined => savedAddresses.find((a) => a.id === id),
    [],
  );

  /** Adım geçerli mi — "Devam et" bu false iken pasif. */
  const canProceed = useCallback(
    (step: CreateStepKey): boolean => {
      switch (step) {
        case 'pickup':
          return !!form.pickupAddressId;
        case 'dropoff':
          return !!form.dropoffAddressId && form.dropoffAddressId !== form.pickupAddressId;
        case 'contacts':
          return (
            form.recipientName.trim().length > 0 &&
            form.recipientPhone.trim().length > 0 &&
            form.senderPhone.trim().length > 0
          );
        case 'price':
          return !quoting && !quoteFailed;
        case 'package':
        case 'schedule':
        case 'confirm':
        default:
          return true;
      }
    },
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
      packageDescription: form.packageNote.trim() || undefined,
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
    requestQuote,
    submit,
    price,
    quoting,
    quoteFailed,
    loading,
    error,
  };
}
