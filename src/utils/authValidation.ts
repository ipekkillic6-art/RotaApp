/**
 * Kimlik doğrulama için saf doğrulayıcılar (e-posta regex, parola kuralları).
 * RN/store'dan bağımsız — node --test ile test edilebilir.
 */

/** Pratikte yeterli e-posta biçim kontrolü: local@domain.tld */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

export const looksLikeEmail = (value: string): boolean => value.includes('@');

/** En az 10 haneli (5xx…) telefon. */
export const isValidPhone = (value: string): boolean => digitsOnly(value).length >= 10;

/** E-posta alanı için hata mesajı (boş/geçersiz). */
export function emailError(email: string): string | undefined {
  if (!email.trim()) return 'E-posta gerekli.';
  return isValidEmail(email) ? undefined : 'Geçerli bir e-posta gir.';
}

/** Parola: en az 8 karakter ve en az bir rakam. */
export function passwordError(password: string): string | undefined {
  if (password.length < 8) return 'Şifre en az 8 karakter olmalı.';
  if (!/\d/.test(password)) return 'Şifre en az bir rakam içermeli.';
  return undefined;
}

/** Girişteki "e-posta veya telefon" alanı — @ varsa e-posta, yoksa telefon. */
export function identifierError(identifier: string): string | undefined {
  const value = identifier.trim();
  if (!value) return 'E-posta veya telefon gerekli.';
  if (looksLikeEmail(value)) return isValidEmail(value) ? undefined : 'Geçerli bir e-posta gir.';
  return isValidPhone(value) ? undefined : 'Geçerli bir e-posta veya telefon gir.';
}

export interface ChangePasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export const INITIAL_CHANGE_PASSWORD: ChangePasswordForm = { current: '', next: '', confirm: '' };

export type ChangePasswordField = 'current' | 'next' | 'confirm';

export function changePasswordErrors(
  form: ChangePasswordForm,
): Partial<Record<ChangePasswordField, string>> {
  const errors: Partial<Record<ChangePasswordField, string>> = {};
  if (!form.current) errors.current = 'Mevcut şifreni gir.';
  const nextError = passwordError(form.next);
  if (nextError) errors.next = nextError;
  else if (form.next === form.current) errors.next = 'Yeni şifre eskisinden farklı olmalı.';
  if (form.confirm !== form.next) errors.confirm = 'Şifreler eşleşmiyor.';
  return errors;
}

export function canChangePassword(form: ChangePasswordForm): boolean {
  return Object.keys(changePasswordErrors(form)).length === 0;
}
