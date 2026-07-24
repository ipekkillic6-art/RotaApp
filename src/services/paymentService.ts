import { api } from '../utils/api';
import { savedCards } from '../mocks/payment';
import type { PaymentCard } from '../types';

/** Kart ekleme gövdesi — tam kart numarası SAKLANMAZ, yalnızca son 4 + marka. */
export interface AddCardPayload {
  brand: PaymentCard['brand'];
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  makeDefault?: boolean;
}

// Oturum boyunca değişiklikleri hatırlayan bellek içi kopya.
let cards: PaymentCard[] = savedCards.map((c) => ({ ...c }));

const withSingleDefault = (list: PaymentCard[], defaultId: string): PaymentCard[] =>
  list.map((c) => ({ ...c, isDefault: c.id === defaultId }));

export const paymentService = {
  getCards: (signal?: AbortSignal) =>
    api.get<PaymentCard[]>('/payment/cards', { signal, mock: () => cards }),

  addCard: (payload: AddCardPayload, signal?: AbortSignal) =>
    api.post<PaymentCard>('/payment/cards', {
      body: payload,
      signal,
      mock: () => {
        const first = cards.length === 0;
        const created: PaymentCard = {
          id: `card-${Date.now()}`,
          brand: payload.brand,
          last4: payload.last4,
          expiryMonth: payload.expiryMonth,
          expiryYear: payload.expiryYear,
          holderName: payload.holderName,
          isDefault: first || !!payload.makeDefault,
        };
        cards = created.isDefault
          ? [...cards.map((c) => ({ ...c, isDefault: false })), created]
          : [...cards, created];
        return created;
      },
    }),

  removeCard: (id: string, signal?: AbortSignal) =>
    api.delete<void>(`/payment/cards/${id}`, {
      signal,
      mock: () => {
        const removed = cards.find((c) => c.id === id);
        cards = cards.filter((c) => c.id !== id);
        // Varsayılan silindiyse kalan ilk kart varsayılan olsun.
        if (removed?.isDefault && cards.length > 0) {
          cards = withSingleDefault(cards, cards[0].id);
        }
      },
    }),

  setDefault: (id: string, signal?: AbortSignal) =>
    api.post<PaymentCard[]>(`/payment/cards/${id}/default`, {
      signal,
      mock: () => {
        cards = withSingleDefault(cards, id);
        return cards;
      },
    }),
};
