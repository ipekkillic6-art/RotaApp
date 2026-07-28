import type { CreateAddressPayload } from '../services/addressService';
import type { Address } from '../types';

/**
 * Adres formu için saf doğrulama.
 *
 * useCreateDeliveryForm/createDeliveryValidation ile aynı desen: ekran ve
 * hook bu modülü çağırır, iş mantığı burada test edilebilir şekilde durur.
 */

export interface AddressForm {
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  contactName: string;
  contactPhone: string;
  note: string;
  /**
   * Haritadan veya GPS'ten gelen tam nokta. Metin alanları elle değiştirilirse
   * düşürülür — bkz. `applyAddressPatch`.
   */
  latitude?: number;
  longitude?: number;
}

export const INITIAL_ADDRESS_FORM: AddressForm = {
  title: '',
  fullAddress: '',
  city: 'İstanbul',
  district: '',
  contactName: '',
  contactPhone: '',
  note: '',
  latitude: undefined,
  longitude: undefined,
};

/**
 * Forma yama uygular.
 *
 * Kural: açık adres ELLE değiştirilirse eski koordinat artık o adrese ait
 * değildir ve düşürülür. Haritadan/GPS'ten gelen güncelleme metni ve
 * koordinatı BİRLİKTE yazdığı için bu kurala takılmaz.
 */
export function applyAddressPatch(form: AddressForm, patch: Partial<AddressForm>): AddressForm {
  const textChangedAlone = 'fullAddress' in patch && !('latitude' in patch);
  const next = { ...form, ...patch };
  if (textChangedAlone) {
    next.latitude = undefined;
    next.longitude = undefined;
  }
  return next;
}

/** Doğrulanan alanlar — ekranda `errorText` bu anahtarlarla eşlenir. */
export type AddressFieldKey = 'title' | 'fullAddress' | 'city' | 'district' | 'contactPhone';

const REQUIRED_FIELDS: AddressFieldKey[] = ['title', 'fullAddress', 'city', 'district'];
const ALL_FIELDS: AddressFieldKey[] = [...REQUIRED_FIELDS, 'contactPhone'];

const digitsOf = (value: string) => value.replace(/\D/g, '');

export function validateAddressField(
  field: AddressFieldKey,
  form: AddressForm,
): string | undefined {
  switch (field) {
    case 'title':
      return form.title.trim().length < 2 ? 'Başlık en az 2 karakter olmalı.' : undefined;
    case 'fullAddress':
      return form.fullAddress.trim().length < 10
        ? 'Açık adres en az 10 karakter olmalı.'
        : undefined;
    case 'city':
      return form.city.trim() ? undefined : 'Şehir gerekli.';
    case 'district':
      return form.district.trim() ? undefined : 'İlçe gerekli.';
    case 'contactPhone': {
      // Telefon opsiyonel; girildiyse 10 haneli (5xx…) olmalı.
      const digits = digitsOf(form.contactPhone);
      if (digits.length === 0) return undefined;
      return digits.length < 10 ? 'Telefon numarası eksik görünüyor.' : undefined;
    }
  }
}

export function addressErrors(form: AddressForm): Partial<Record<AddressFieldKey, string>> {
  const errors: Partial<Record<AddressFieldKey, string>> = {};
  for (const field of ALL_FIELDS) {
    const message = validateAddressField(field, form);
    if (message) errors[field] = message;
  }
  return errors;
}

export function canSubmitAddress(form: AddressForm): boolean {
  return Object.keys(addressErrors(form)).length === 0;
}

/**
 * Mevcut adres → form (düzenleme ekranını ön-doldurmak için).
 *
 * Koordinat da taşınır: aksi halde bir adresin yalnızca başlığını düzeltip
 * kaydetmek, haritadan seçilmiş konumunu silerdi.
 */
export function addressToForm(address: Address): AddressForm {
  return {
    title: address.title,
    fullAddress: address.fullAddress,
    city: address.city,
    district: address.district,
    contactName: address.contactName ?? '',
    contactPhone: address.contactPhone ?? '',
    note: address.note ?? '',
    latitude: address.latitude,
    longitude: address.longitude,
  };
}

/** Form → API gövdesi; boş opsiyonel alanlar `undefined` olur. */
export function toCreateAddressPayload(form: AddressForm): CreateAddressPayload {
  return {
    title: form.title.trim(),
    fullAddress: form.fullAddress.trim(),
    city: form.city.trim(),
    district: form.district.trim(),
    contactName: form.contactName.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    note: form.note.trim() || undefined,
    latitude: form.latitude,
    longitude: form.longitude,
  };
}
