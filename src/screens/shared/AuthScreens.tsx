import React, { useState } from 'react';
import { View } from 'react-native';
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
} from '../../design-system';

export interface LoginScreenProps {
  /** Server-side failure, shown above the form. */
  errorText?: string;
  loading?: boolean;
  onSubmit?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

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
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginScreenProps) {
  const theme = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenContainer>
      <SafeAreaContainer>
        <ScrollContainer keyboardAware>
          <View style={{ alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing['3xl'] }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.action.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={Route} size="xl" color={theme.colors.text.inverse} strokeWidth={2.25} />
            </View>
            <Typography variant="h1">Tekrar hoş geldin</Typography>
            <Typography variant="bodySm" tone="secondary" align="center">
              Teslimatlarını takip etmek için giriş yap.
            </Typography>
          </View>

          <View style={{ gap: theme.spacing.lg }}>
            {errorText && <InlineAlert tone="error" message={errorText} />}

            <TextField
              label="Telefon veya e-posta"
              placeholder="ornek@sirket.com"
              icon={Mail}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              required
            />
            <TextField
              label="Şifre"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />

            <View style={{ alignItems: 'flex-end' }}>
              <Button
                label="Şifremi unuttum"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={onForgotPassword}
              />
            </View>

            <Button label="Giriş yap" onPress={onSubmit} loading={loading} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Divider />
              </View>
              <Typography variant="micro" tone="muted">
                veya
              </Typography>
              <View style={{ flex: 1 }}>
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

export interface RegisterScreenProps {
  /** Field-level errors keyed by field name. */
  errors?: Partial<Record<'fullName' | 'phone' | 'email' | 'password' | 'terms', string>>;
  loading?: boolean;
  onSubmit?: () => void;
  onBack?: () => void;
}

export function RegisterScreen({ errors, loading, onSubmit, onBack }: RegisterScreenProps) {
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
            <TextField
              label="Ad soyad"
              placeholder="Adınız ve soyadınız"
              icon={User}
              value={fullName}
              onChangeText={setFullName}
              errorText={errors?.fullName}
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
              required
            />
            <TextField
              label="Şifre"
              placeholder="En az 8 karakter"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorText={errors?.password}
              helperText={errors?.password ? undefined : 'En az 8 karakter, bir rakam içermeli.'}
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

            <Button label="Hesabı oluştur" onPress={onSubmit} loading={loading} />
          </View>
        </ScrollContainer>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}
