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
