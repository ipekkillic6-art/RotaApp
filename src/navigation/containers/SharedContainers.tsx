import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/shared/SplashScreen';
import { OnboardingScreen } from '../../screens/shared/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../../screens/shared/AuthScreens';
import { RoleSelectScreen } from '../../screens/shared/RoleSelectScreen';
import { ProfileScreen } from '../../screens/shared/ProfileScreen';
import { PrivacySecurityScreen } from '../../screens/shared/PrivacySecurityScreen';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';

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
  // Başarıda RootNavigator koşullu olarak RoleSelect'e geçer — navigate gerekmez.
  return (
    <LoginScreen
      loading={loading}
      errorText={error}
      onSubmit={({ identifier, password }) => login({ email: identifier.trim(), password })}
      onForgotPassword={() =>
        Alert.alert(
          'Şifre sıfırlama',
          'E-posta veya telefonunu gir, sıfırlama bağlantısı gönderelim.',
          [{ text: 'Tamam' }],
        )
      }
      onRegister={() => navigation.navigate(ROUTES.REGISTER)}
    />
  );
}

export function RegisterContainer() {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  return (
    <RegisterScreen
      loading={loading}
      onBack={() => navigation.goBack()}
      onSubmit={({ fullName, email, password }) =>
        register({ name: fullName.trim(), email: email.trim(), password, role: 'customer' })
      }
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
        else if (key === 'notifications') navigation.navigate(ROUTES.NOTIFICATIONS);
        else if (key === 'privacy') navigation.navigate(ROUTES.PRIVACY_SECURITY);
        else Alert.alert('Yardım ve destek', 'destek@rota.app · 0850 000 00 00', [{ text: 'Tamam' }]);
      }}
      onLogout={logout}
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
      onChangePassword={() =>
        Alert.alert(
          'Şifreyi değiştir',
          'Kayıtlı e-postana bir sıfırlama bağlantısı göndereceğiz.',
          [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Bağlantı gönder' }],
        )
      }
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
