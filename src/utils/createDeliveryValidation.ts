import { phoneError } from './authValidation.ts';
import type { DeliverySpeed, PackageTypeId } from '../types';

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
  /** Teslimat hızı — fiyat adımında seçilir, ücreti doğrudan etkiler. */
  speed: DeliverySpeed;
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
  speed: 'standard',
  senderPhone: '532 114 22 07',
  recipientName: '',
  recipientPhone: '',
  timing: 'now',
  paymentCardId: null,
};

export type ContactFieldKey = 'senderPhone' | 'recipientName' | 'recipientPhone';

/**
 * "Gönderici ve alıcı" adımının hataları.
 *
 * Alıcı numarası kritik: teslimat kodu oraya gönderiliyor ve kurye teslimat
 * sırasında o numarayı arıyor. Bu yüzden sadece boş olmaması yetmez.
 */
export function contactErrors(form: CreateDeliveryForm): Partial<Record<ContactFieldKey, string>> {
  const errors: Partial<Record<ContactFieldKey, string>> = {};
  const senderError = phoneError(form.senderPhone);
  if (senderError) errors.senderPhone = senderError;
  if (!form.recipientName.trim()) errors.recipientName = 'Alıcının adı gerekli.';
  const recipientError = phoneError(form.recipientPhone);
  if (recipientError) errors.recipientPhone = recipientError;
  return errors;
}

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
      // Numaralar yalnızca dolu değil, ARANABİLİR olmalı: teslimat kodu bu
      // numaraya gidiyor ve kurye buradan arıyor.
      return Object.keys(contactErrors(form)).length === 0;
    case 'price':
      return !price.quoting && !price.quoteFailed;
    case 'payment':
      return !!form.paymentCardId;
    default:
      return true;
  }
}
