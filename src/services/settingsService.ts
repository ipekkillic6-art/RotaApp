import { api } from '../utils/api';
import { defaultPrivacySettings } from '../mocks/settings';
import type { PrivacySettings } from '../types';

// Mock: oturum boyunca değişiklikleri hatırlayan bellek içi kopya.
let currentPrivacy: PrivacySettings = { ...defaultPrivacySettings };

export const settingsService = {
  getPrivacy: (signal?: AbortSignal) =>
    api.get<PrivacySettings>('/settings/privacy', { signal, mock: () => currentPrivacy }),

  updatePrivacy: (patch: Partial<PrivacySettings>, signal?: AbortSignal) =>
    api.patch<PrivacySettings>('/settings/privacy', {
      body: patch,
      signal,
      mock: () => {
        currentPrivacy = { ...currentPrivacy, ...patch };
        return currentPrivacy;
      },
    }),
};
