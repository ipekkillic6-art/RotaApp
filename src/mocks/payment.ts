import type { PaymentCard } from '../types';

/** Kayıtlı kartlar (mock). Yalnızca son 4 hane + marka tutulur. */
export const savedCards: PaymentCard[] = [
  {
    id: 'card-01',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2030,
    holderName: 'İpek Kılıç',
    isDefault: true,
  },
  {
    id: 'card-02',
    brand: 'mastercard',
    last4: '4444',
    expiryMonth: 8,
    expiryYear: 2028,
    holderName: 'İpek Kılıç',
    isDefault: false,
  },
];
