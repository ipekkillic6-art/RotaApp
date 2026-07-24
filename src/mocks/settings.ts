import type { PrivacySettings } from '../types';

/** Makul varsayılanlar: güvenlik açık, veri paylaşımı kapalı (gizlilik dostu). */
export const defaultPrivacySettings: PrivacySettings = {
  biometricLogin: true,
  twoFactor: false,
  locationSharing: true,
  usageAnalytics: false,
  personalizedOffers: true,
};
