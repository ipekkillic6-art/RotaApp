import { API_CONFIG, MOCK_LATENCY_MS } from '../constants/config';
import { secure, STORAGE_KEYS } from './storage';

/**
 * Tek HTTP kapısı. Çıplak fetch yasak (ESLint guard yakalar) — her istek buradan.
 *
 * - Authorization header'ı token'ı secure-store'dan alır
 * - 401 → refresh → tek sefer retry (refresh çağrısı retry ETMEZ)
 * - Hata gövdesi tipli ApiError'a çevrilir
 * - okStatuses ile bazı durumlar (404 gibi) hata sayılmayabilir
 * - AbortSignal desteği
 * - API_CONFIG.USE_MOCKS true iken `mock` verilirse backend beklemeden onu döner
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<T> {
  body?: unknown;
  signal?: AbortSignal;
  /** Hata sayılmayacak durum kodları (örn. [404]). */
  okStatuses?: number[];
  /** Authorization header eklenmesin (login/register/refresh). */
  noAuth?: boolean;
  /** USE_MOCKS true iken bu döner — Faz 5 backend beklemeden ilerler. */
  mock?: () => T | Promise<T>;
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function authHeader(noAuth?: boolean): Promise<Record<string, string>> {
  if (noAuth) return {};
  const token = await secure.get(STORAGE_KEYS.authToken);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 401'de tek sefer denenir; başarısızsa oturum düşer. Kendisi retry EDİLMEZ. */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await secure.get(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token: string; refreshToken?: string };
    await secure.set(STORAGE_KEYS.authToken, data.token);
    if (data.refreshToken) await secure.set(STORAGE_KEYS.refreshToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function rawRequest<T>(
  method: Method,
  path: string,
  opts: RequestOptions<T>,
  isRetry: boolean,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
  // Dışarıdan gelen signal iptal ederse bizimkini de iptal et.
  opts.signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeader(opts.noAuth)),
      },
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    if (res.status === 401 && !opts.noAuth && !isRetry) {
      const refreshed = await tryRefreshToken();
      if (refreshed) return rawRequest<T>(method, path, opts, true);
    }

    const isOk = res.ok || opts.okStatuses?.includes(res.status);
    if (!isOk) {
      const body = await res.json().catch(() => undefined);
      const message =
        (body as { message?: string })?.message ?? `İstek başarısız (${res.status})`;
      throw new ApiError(res.status, message, body);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json().catch(() => undefined)) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(method: Method, path: string, opts: RequestOptions<T> = {}): Promise<T> {
  if (API_CONFIG.USE_MOCKS && opts.mock) {
    await delay(MOCK_LATENCY_MS);
    if (opts.signal?.aborted) throw new ApiError(0, 'İstek iptal edildi');
    return opts.mock();
  }
  return rawRequest<T>(method, path, opts, false);
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions<T>) => request<T>('GET', path, opts),
  post: <T>(path: string, opts?: RequestOptions<T>) => request<T>('POST', path, opts),
  put: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PUT', path, opts),
  patch: <T>(path: string, opts?: RequestOptions<T>) => request<T>('PATCH', path, opts),
  delete: <T>(path: string, opts?: RequestOptions<T>) => request<T>('DELETE', path, opts),
};
