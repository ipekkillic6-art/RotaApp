import { create } from 'zustand';
import { settingsService } from '../services/settingsService';
import type { PrivacySettings, PrivacySettingKey } from '../types';

interface SettingsState {
  privacy: PrivacySettings | null;
  loading: boolean;
  error?: string;

  fetchPrivacy: () => Promise<void>;
  setPrivacy: (key: PrivacySettingKey, value: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  privacy: null,
  loading: false,
  error: undefined,

  fetchPrivacy: async () => {
    set({ loading: true, error: undefined });
    try {
      set({ privacy: await settingsService.getPrivacy(), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ayarlar yüklenemedi' });
    }
  },

  setPrivacy: async (key, value) => {
    const previous = get().privacy;
    if (!previous) return;
    // İyimser güncelle — anahtar anında tepki versin; hata olursa geri al.
    set({ privacy: { ...previous, [key]: value }, error: undefined });
    try {
      const updated = await settingsService.updatePrivacy({ [key]: value });
      set({ privacy: updated });
    } catch (e) {
      set({ privacy: previous, error: e instanceof Error ? e.message : 'Ayar kaydedilemedi' });
    }
  },
}));
