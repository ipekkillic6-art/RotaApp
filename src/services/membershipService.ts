import { api, ApiError } from '../utils/api';
import { initialMembership, membershipPlans } from '../mocks/membership';
import { addPeriod, canCancel, canSubscribe } from '../utils/membership';
import type { Membership, MembershipPlanId, MembershipPlan } from '../types';

export interface SubscribePayload {
  planId: MembershipPlanId;
  /** Tahsilatın yapılacağı kayıtlı kart. */
  cardId: string;
}

// Oturum boyunca değişiklikleri hatırlayan bellek içi kopya.
let membership: Membership = { ...initialMembership };

const planById = (id: MembershipPlanId): MembershipPlan | undefined =>
  membershipPlans.find((p) => p.id === id);

export const membershipService = {
  getPlans: (signal?: AbortSignal) =>
    api.get<MembershipPlan[]>('/membership/plans', { signal, mock: () => membershipPlans }),

  getMembership: (signal?: AbortSignal) =>
    api.get<Membership>('/membership', { signal, mock: () => membership }),

  /**
   * Üyelik başlat. Avantajı süren bir üyelik varken ikinci kez satın
   * alınamaz — aksi halde kullanıcı aynı dönem için iki kez ödeme yapardı.
   */
  subscribe: (payload: SubscribePayload, signal?: AbortSignal) =>
    api.post<Membership>('/membership/subscribe', {
      body: payload,
      signal,
      mock: () => {
        const now = new Date();
        if (!canSubscribe(membership, now)) {
          throw new ApiError(409, 'Zaten sürmekte olan bir üyeliğin var.');
        }
        const plan = planById(payload.planId);
        if (!plan) {
          throw new ApiError(400, 'Geçersiz plan.', { field: 'planId' });
        }
        if (!payload.cardId) {
          throw new ApiError(400, 'Ödeme için bir kart seç.', { field: 'cardId' });
        }
        membership = {
          status: 'active',
          planId: plan.id,
          startedAt: now.toISOString(),
          renewsAt: addPeriod(now, plan.period).toISOString(),
          cardId: payload.cardId,
        };
        return membership;
      },
    }),

  /**
   * Üyeliği iptal et. Avantajlar peşin ödenen dönemin sonuna kadar sürer;
   * bu yüzden kayıt silinmez, `cancelled` + `endsAt` olarak işaretlenir.
   */
  cancel: (signal?: AbortSignal) =>
    api.post<Membership>('/membership/cancel', {
      signal,
      mock: () => {
        if (!canCancel(membership)) {
          throw new ApiError(409, 'İptal edilecek bir üyelik yok.');
        }
        membership = {
          ...membership,
          status: 'cancelled',
          endsAt: membership.renewsAt,
          renewsAt: undefined,
        };
        return membership;
      },
    }),
};
