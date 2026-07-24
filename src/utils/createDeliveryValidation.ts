import type { PackageTypeId } from '../types';

/**
 * Teslimat oluşturma formunun SAF veri modeli + adım doğrulaması.
 *
 * RN/Zustand'dan bağımsız — böylece node --test ile test edilebilir.
 * useCreateDeliveryForm hook'u bunu kullanır.
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
  /** Ödemenin alınacağı kayıtlı kart. */
  paymentCardId: string | null;
}

export const INITIAL_FORM: CreateDeliveryForm = {
  pickupAddressId: null,
  dropoffAddressId: null,
  packageType: 'small',
  packageNote: '',
  senderPhone: '532 114 22 07',
  recipientName: '',
  recipientPhone: '',
  timing: 'now',
  paymentCardId: null,
};

export interface PriceState {
  quoting: boolean;
  quoteFailed: boolean;
}

/** Adım geçerli mi — "Devam et" bu false iken pasif. */
export function canProceedForStep(
  step: string,
  form: CreateDeliveryForm,
  price: PriceState = { quoting: false, quoteFailed: false },
): boolean {
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
      return !price.quoting && !price.quoteFailed;
    case 'payment':
      return !!form.paymentCardId;
    default:
      return true;
  }
}
