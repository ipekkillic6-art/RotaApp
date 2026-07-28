import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/shared/SplashScreen';
import { OnboardingScreen } from '../../screens/shared/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../../screens/shared/AuthScreens';
import { RoleSelectScreen } from '../../screens/shared/RoleSelectScreen';
import { ProfileScreen } from '../../screens/shared/ProfileScreen';
import { PrivacySecurityScreen } from '../../screens/shared/PrivacySecurityScreen';
import { ForgotPasswordScreen } from '../../screens/shared/ForgotPasswordScreen';
import { ChangePasswordScreen } from '../../screens/shared/ChangePasswordScreen';
import { HelpSupportScreen } from '../../screens/shared/HelpSupportScreen';
import { PaymentMethodsScreen } from '../../screens/shared/PaymentMethodsScreen';
import { AddCardScreen } from '../../screens/shared/AddCardScreen';
import { MembershipScreen } from '../../screens/shared/MembershipScreen';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { usePaymentStore } from '../../stores/paymentStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { useCardForm } from '../../hooks/useCardForm';
import { faqItems } from '../../mocks/support';
import { SUPPORT } from '../../constants/config';
import {
  changePasswordErrors,
  emailError,
  identifierError,
  passwordError,
  INITIAL_CHANGE_PASSWORD,
  type ChangePasswordForm,
} from '../../utils/authValidation';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';

type RegisterErrors = Partial<Record<'fullName' | 'phone' | 'email' | 'password' | 'terms', string>>;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SplashContainer() {
  return <SplashScreen />;
}

export function OnboardingContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <OnboardingScreen
      onFinish={() => navigation.navigate(ROUTES.LOGIN)}
      onSkip={() => navigation.navigate(ROUTES.LOGIN)}
    />
  );
}

export function LoginContainer() {
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [clientError, setClientError] = useState<string>();
  // Başarıda RootNavigator koşullu olarak RoleSelect'e geçer — navigate gerekmez.
  return (
    <LoginScreen
      loading={loading}
      errorText={clientError ?? error}
      onSubmit={({ identifier, password }) => {
        const idError = identifierError(identifier);
        if (idError) {
          setClientError(idError);
          return;
        }
        if (!password) {
          setClientError('Şifreni gir.');
          return;
        }
        setClientError(undefined);
        login({ email: identifier.trim(), password });
      }}
      onForgotPassword={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
      onRegister={() => navigation.navigate(ROUTES.REGISTER)}
    />
  );
}

export function RegisterContainer() {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const errorField = useAuthStore((s) => s.errorField);
  const [errors, setErrors] = useState<RegisterErrors>({});

  // Sunucu hatayı bir alana bağladıysa (örn. e-posta zaten kayıtlı) uyarıyı
  // o alanın altında göster; üstteki genel banda düşürme.
  const fieldErrors: RegisterErrors =
    errorField === 'email' && error ? { ...errors, email: error } : errors;

  return (
    <RegisterScreen
      loading={loading}
      errors={fieldErrors}
      errorText={errorField ? undefined : error}
      onBack={() => navigation.goBack()}
      onSubmit={({ fullName, email, password }) => {
        const next: RegisterErrors = {};
        if (!fullName.trim()) next.fullName = 'Ad soyad gerekli.';
        const emError = emailError(email);
        if (emError) next.email = emError;
        const pwError = passwordError(password);
        if (pwError) next.password = pwError;
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        register({ name: fullName.trim(), email: email.trim(), password, role: 'customer' });
      }}
    />
  );
}

export function ForgotPasswordContainer() {
  const navigation = useNavigation<Nav>();
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [sent, setSent] = useState(false);
  return (
    <ForgotPasswordScreen
      sending={loading}
      sent={sent}
      errorText={error}
      onSubmit={async (email) => {
        const ok = await requestPasswordReset(email);
        if (ok) setSent(true);
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

export function ChangePasswordContainer() {
  const navigation = useNavigation<Nav>();
  const changePassword = useAuthStore((s) => s.changePassword);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [form, setForm] = useState<ChangePasswordForm>(INITIAL_CHANGE_PASSWORD);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? changePasswordErrors(form) : {};
  return (
    <ChangePasswordScreen
      form={form}
      errors={errors}
      saving={loading}
      errorText={error}
      onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      onSubmit={async () => {
        setSubmitted(true);
        if (Object.keys(changePasswordErrors(form)).length > 0) return;
        const ok = await changePassword(form.current, form.next);
        if (ok) {
          Alert.alert('Şifre güncellendi', 'Şifren başarıyla değiştirildi.', [
            { text: 'Tamam', onPress: () => navigation.goBack() },
          ]);
        }
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

export function RoleSelectContainer() {
  const setRole = useAuthStore((s) => s.setRole);
  // setRole rolü kalıcı yazar; RootNavigator o rolün tab'larına geçer.
  return <RoleSelectScreen onContinue={(role) => setRole(role)} />;
}

export function ProfileContainer() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  // Çıkışta oturum temizlenir; RootNavigator otomatik giriş akışına döner.
  return (
    <ProfileScreen
      userName={user?.name ?? 'Misafir'}
      email={user?.email}
      role={role ?? 'customer'}
      onSelectItem={(key) => {
        if (key === 'addresses') navigation.navigate(ROUTES.ADDRESS_PICKER);
        else if (key === 'membership') navigation.navigate(ROUTES.MEMBERSHIP);
        else if (key === 'payment') navigation.navigate(ROUTES.PAYMENT_METHODS);
        else if (key === 'notifications') navigation.navigate(ROUTES.NOTIFICATIONS);
        else if (key === 'privacy') navigation.navigate(ROUTES.PRIVACY_SECURITY);
        else navigation.navigate(ROUTES.HELP_SUPPORT);
      }}
      onLogout={logout}
    />
  );
}

export function PaymentMethodsContainer() {
  const navigation = useNavigation<Nav>();
  const cards = usePaymentStore((s) => s.cards);
  const loading = usePaymentStore((s) => s.loading);
  const error = usePaymentStore((s) => s.error);
  const fetchCards = usePaymentStore((s) => s.fetchCards);
  const removeCard = usePaymentStore((s) => s.removeCard);
  const setDefault = usePaymentStore((s) => s.setDefault);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return (
    <PaymentMethodsScreen
      cards={cards}
      loading={loading}
      errorText={error}
      onAddCard={() => navigation.navigate(ROUTES.ADD_CARD)}
      onSetDefault={(id) => setDefault(id)}
      onRemove={(id) =>
        Alert.alert('Kartı sil', 'Bu kart kayıtlı ödeme yöntemlerinden kaldırılsın mı?', [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Sil', style: 'destructive', onPress: () => removeCard(id) },
        ])
      }
      onBack={() => navigation.goBack()}
    />
  );
}

export function MembershipContainer() {
  const navigation = useNavigation<Nav>();
  const plans = useMembershipStore((s) => s.plans);
  const membership = useMembershipStore((s) => s.membership);
  const loading = useMembershipStore((s) => s.loading);
  const saving = useMembershipStore((s) => s.saving);
  const error = useMembershipStore((s) => s.error);
  const fetchMembership = useMembershipStore((s) => s.fetch);
  const subscribe = useMembershipStore((s) => s.subscribe);
  const cancel = useMembershipStore((s) => s.cancel);

  // Tahsilat varsayılan karttan yapılır; kart listesi de gerekir.
  const cards = usePaymentStore((s) => s.cards);
  const fetchCards = usePaymentStore((s) => s.fetchCards);
  const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];

  useEffect(() => {
    fetchMembership();
    fetchCards();
  }, [fetchMembership, fetchCards]);

  return (
    <MembershipScreen
      plans={plans}
      membership={membership}
      defaultCard={defaultCard}
      loading={loading}
      saving={saving}
      errorText={error}
      onSubscribe={(planId) => {
        if (!defaultCard) return;
        subscribe({ planId, cardId: defaultCard.id });
      }}
      onCancel={() => cancel()}
      onAddCard={() => navigation.navigate(ROUTES.ADD_CARD)}
      onBack={() => navigation.goBack()}
    />
  );
}

export function AddCardContainer() {
  const navigation = useNavigation<Nav>();
  const { form, update, errors, canSubmit, brand, makeDefault, setMakeDefault, saving, error, submit } =
    useCardForm();

  return (
    <AddCardScreen
      form={form}
      brand={brand}
      errors={errors}
      canSubmit={canSubmit}
      saving={saving}
      makeDefault={makeDefault}
      errorText={error}
      onChange={update}
      onToggleDefault={setMakeDefault}
      onSubmit={async () => {
        const created = await submit();
        if (created) navigation.goBack();
      }}
      onClose={() => navigation.goBack()}
    />
  );
}

export function HelpSupportContainer() {
  const navigation = useNavigation<Nav>();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  // Bağlantı açılamazsa (ör. simülatörde mail yoksa) kullanıcıya bilgi ver.
  const open = (url: string, fallback: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Açılamadı', fallback, [{ text: 'Tamam' }]));

  return (
    <HelpSupportScreen
      faqs={faqItems}
      email={SUPPORT.email}
      phone={SUPPORT.phone}
      appVersion={appVersion}
      onEmail={() => open(`mailto:${SUPPORT.email}`, SUPPORT.email)}
      onCall={() => open(`tel:${SUPPORT.phoneDial}`, SUPPORT.phone)}
      onLiveChat={() =>
        Alert.alert('Canlı destek', 'Hafta içi 09:00 – 18:00 arası buradayız.', [{ text: 'Tamam' }])
      }
      onTerms={() => open(SUPPORT.termsUrl, SUPPORT.termsUrl)}
      onPrivacyPolicy={() => open(SUPPORT.privacyUrl, SUPPORT.privacyUrl)}
      onBack={() => navigation.goBack()}
    />
  );
}

export function PrivacySecurityContainer() {
  const navigation = useNavigation<Nav>();
  const privacy = useSettingsStore((s) => s.privacy);
  const loading = useSettingsStore((s) => s.loading);
  const error = useSettingsStore((s) => s.error);
  const fetchPrivacy = useSettingsStore((s) => s.fetchPrivacy);
  const setPrivacy = useSettingsStore((s) => s.setPrivacy);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    fetchPrivacy();
  }, [fetchPrivacy]);

  return (
    <PrivacySecurityScreen
      settings={privacy ?? undefined}
      loading={loading}
      errorText={error}
      onToggle={(key, value) => setPrivacy(key, value)}
      onChangePassword={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
      onLogoutAllDevices={() =>
        Alert.alert(
          'Tüm cihazlardan çıkış',
          'Bu hesabın açık olduğu tüm cihazlarda oturum kapatılacak.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Çıkış yap', style: 'destructive', onPress: () => logout() },
          ],
        )
      }
      onDeleteAccount={() =>
        Alert.alert(
          'Hesabımı sil',
          'Hesabın ve tüm teslimat geçmişin kalıcı olarak silinir. Bu işlem geri alınamaz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Hesabı sil', style: 'destructive', onPress: () => logout() },
          ],
        )
      }
      onBack={() => navigation.goBack()}
    />
  );
}
