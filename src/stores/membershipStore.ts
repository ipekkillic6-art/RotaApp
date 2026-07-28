import { create } from 'zustand';
import { membershipService, type SubscribePayload } from '../services/membershipService';
import type { Membership, MembershipPlan } from '../types';

interface MembershipState {
  plans: MembershipPlan[];
  membership: Membership;
  loading: boolean;
  saving: boolean;
  error?: string;

  fetch: () => Promise<void>;
  subscribe: (payload: SubscribePayload) => Promise<boolean>;
  cancel: () => Promise<boolean>;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: [],
  membership: { status: 'none' },
  loading: false,
  saving: false,
  error: undefined,

  fetch: async () => {
    set({ loading: true, error: undefined });
    try {
      // Planlar ve mevcut üyelik birlikte gerekir; tek beklemede alınır.
      const [plans, membership] = await Promise.all([
        membershipService.getPlans(),
        membershipService.getMembership(),
      ]);
      set({ plans, membership, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Üyelik bilgisi alınamadı' });
    }
  },

  subscribe: async (payload) => {
    set({ saving: true, error: undefined });
    try {
      const membership = await membershipService.subscribe(payload);
      set({ membership, saving: false });
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Üyelik başlatılamadı' });
      return false;
    }
  },

  cancel: async () => {
    set({ saving: true, error: undefined });
    try {
      const membership = await membershipService.cancel();
      set({ membership, saving: false });
      return true;
    } catch (e) {
      set({ saving: false, error: e instanceof Error ? e.message : 'Üyelik iptal edilemedi' });
      return false;
    }
  },
}));
