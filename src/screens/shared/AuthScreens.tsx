import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Lock, Mail, Route, User } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  Checkbox,
  Divider,
  Icon,
  InlineAlert,
  PhoneField,
  SafeAreaContainer,
  ScreenContainer,
  ScrollContainer,
  TextField,
  Typography,
  useTheme,
  useThemedStyles,
  type Theme,
} from '../../design-system';

export interface LoginScreenProps {
  /** Server-side failure, shown above the form. */
  errorText?: string;
  loading?: boolean;
  /** "Beni hatırla" ile saklanmış kimlik — alanı önceden doldurur. */
  initialIdentifier?: string;
  /** "Beni hatırla" ile saklanmış parola — şifre alanını önceden doldurur. */
  initialPassword?: string;
  onSubmit?: (credentials: {
    identifier: string;
    password: string;
    remember: boolean;
  }) => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

const makeLoginStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing['3xl'],
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.action.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: { gap: theme.spacing.lg },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    /** Checkbox'ın etiketi flex:1 — Touchable'a genişlik verilmezse yazı 0'a büzülür. */
    rememberCheckbox: { flex: 1 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    dividerLine: { flex: 1 },
  });

/**
 * Login.
 *
 * A single identifier field takes either a phone number or an e-mail — asking
 * the user to first choose which kind of credential they have is a step that
 * exists only for the backend's convenience.
 */
export function LoginScreen({
  errorText,
  loading = false,
  initialIdentifier,
  initialPassword,
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginScreenProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeLoginStyles);
  const [identifier, setIdentifier] = useState(initialIdentifier ?? '');
  const [password, setPassword] = useState(initialPassword ?? '');
  // Hatırlanmış bir kimlik varsa kullanıcı bunu daha önce istemiştir.
  const [remember, setRemember] = useState(Boolean(initialIdentifier));

  /**
   * Kimlik hatırlanan hesaptan farklı bir şeye çevrilirse dolu gelen parola
   * artık o hesaba ait değil — temizlenir. Aksi halde kullanıcı başka bir
   * hesabın parolasıyla giriş denemiş olurdu.
   */
  const changeIdentifier = useCallback(
    (value: string) => {
      setIdentifier(value);
      if (initialPassword && value.trim() !== (initialIdentifier ?? '').trim()) {
        setPassword('');
      }
    },
    [initialIdentifier, initialPassword],
  );

  // Button memoize edilmiş; onPress her tuşta yeni referans alırsa memo boşa
  // çıkar ve buton her karakterde yeniden render olur. Güncel değerleri bir
  // ref'te tutup callback'i kalıcı olarak sabitliyoruz.
  const latest = useRef({ identifier, password, remember, onSubmit });
  latest.current = { identifier, password, remember, onSubmit };
  const submit = useCallback(() => {
    const current = latest.current;
    current.onSubmit?.({
      identifier: current.identifier,
      password: current.password,
      remember: current.remember,
    });
  }, []);

  return (
    <ScreenContainer>
      <SafeAreaContainer>
        <ScrollContainer keyboardAware>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon icon={Route} size="xl" color={theme.colors.text.inverse} strokeWidth={2.25} />
            </View>
            <Typography variant="h1">Tekrar hoş geldin</Typography>
            <Typography variant="bodySm" tone="secondary" align="center">
              Teslimatlarını takip etmek için giriş yap.
            </Typography>
          </View>

          <View style={styles.form}>
            {errorText && <InlineAlert tone="error" message={errorText} />}

            {/* AutoFill: iOS bu iki alanı görünce girişten sonra parolayı
                Keychain'e kaydetmeyi önerir ve sonraki girişte doldurur. */}
            <TextField
              label="Telefon veya e-posta"
              placeholder="ornek@sirket.com"
              icon={Mail}
              value={identifier}
              onChangeText={changeIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
              autoComplete="username"
              required
            />
            <TextField
              label="Şifre"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoComplete="current-password"
              required
            />

            <View style={styles.rememberRow}>
              <Checkbox
                label="Beni hatırla"
                checked={remember}
                onChange={setRemember}
                accessibilityLabel="Beni hatırla — e-postanı bir dahaki girişte hazır tutar"
                style={styles.rememberCheckbox}
              />
              <Button
                label="Şifremi unuttum"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={onForgotPassword}
              />
            </View>

            <Button
              label="Giriş yap"
              onPress={submit}
              loading={loading}
              disabled={identifier.trim().length === 0 || password.length === 0}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine}>
                <Divider />
              </View>
              <Typography variant="micro" tone="muted">
                veya
              </Typography>
              <View style={styles.dividerLine}>
                <Divider />
              </View>
            </View>

            <Button label="Hesabın yok mu? Kayıt ol" variant="tertiary" onPress={onRegister} />
          </View>
        </ScrollContainer>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}

export interface RegisterValues {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  /** Koşullar kabul edildi mi — buton kilidine ek olarak container da doğrular. */
  terms: boolean;
}

export interface RegisterScreenProps {
  /** Field-level errors keyed by field name. */
  errors?: Partial<Record<'fullName' | 'phone' | 'email' | 'password' | 'terms', string>>;
  /** Server-side failure, shown above the form. */
  errorText?: string;
  loading?: boolean;
  onSubmit?: (values: RegisterValues) => void;
  onBack?: () => void;
}

export function RegisterScreen({ errors, errorText, loading, onSubmit, onBack }: RegisterScreenProps) {
  const theme = useTheme();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);

  return (
    <ScreenContainer>
      <SafeAreaContainer>
        <AppHeader title="Hesap oluştur" onBack={onBack} />
        <ScrollContainer keyboardAware>
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
            {errorText && <InlineAlert tone="error" message={errorText} />}
            <TextField
              label="Ad soyad"
              placeholder="Adınız ve soyadınız"
              icon={User}
              value={fullName}
              onChangeText={setFullName}
              errorText={errors?.fullName}
              textContentType="name"
              autoComplete="name"
              required
            />
            <PhoneField
              label="Telefon"
              value={phone}
              onChangeText={setPhone}
              errorText={errors?.phone}
              helperText="Kurye seninle bu numaradan iletişime geçer."
              required
            />
            <TextField
              label="E-posta"
              placeholder="ornek@sirket.com"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              errorText={errors?.email}
              textContentType="username"
              autoComplete="email"
              required
            />
            {/* `newPassword`: iOS burada güçlü parola önerir ve kaydeder —
                mevcut parolayı doldurmaya çalışmaz. */}
            <TextField
              label="Şifre"
              placeholder="En az 8 karakter"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorText={errors?.password}
              helperText={errors?.password ? undefined : 'En az 8 karakter, bir rakam içermeli.'}
              textContentType="newPassword"
              autoComplete="new-password"
              required
            />

            <View style={{ gap: theme.spacing.xs }}>
              <Checkbox
                label="Kullanım koşullarını ve gizlilik politikasını kabul ediyorum"
                checked={terms}
                onChange={setTerms}
              />
              {errors?.terms && (
                <Typography variant="micro" tone="danger">
                  {errors.terms}
                </Typography>
              )}
            </View>

            <Button
              label="Hesabı oluştur"
              onPress={() => onSubmit?.({ fullName, phone, email, password, terms })}
              loading={loading}
              disabled={
                fullName.trim().length === 0 ||
                email.trim().length === 0 ||
                password.length === 0 ||
                !terms
              }
            />
          </View>
        </ScrollContainer>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}
