/**
 * Uygulama yapılandırması.
 *
 * BASE_URL genel (gizli olmayan) bir değerdir → EXPO_PUBLIC_ öneki ile env'den.
 * Gerçek gizli anahtarlar istemciye gömülmez, backend'de kalır.
 */
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.rota.local',
  /** Backend hazır olunca false yapılır. true iken servisler mock döner. */
  USE_MOCKS: true,
  TIMEOUT_MS: 15_000,
} as const;

/** Mock modunda sahte ağ gecikmesi (ms) — loading durumları görünsün diye. */
export const MOCK_LATENCY_MS = 350;

/** Yardım ve destek iletişim kanalları + yasal bağlantılar. */
export const SUPPORT = {
  email: 'destek@rota.app',
  /** Ekranda gösterilen okunur biçim. */
  phone: '0850 000 00 00',
  /** tel: bağlantısı için ham numara. */
  phoneDial: '+908500000000',
  termsUrl: 'https://rota.app/kullanim-kosullari',
  privacyUrl: 'https://rota.app/gizlilik-politikasi',
} as const;
