import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/shared/SplashScreen';
import { OnboardingScreen } from '../../screens/shared/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../../screens/shared/AuthScreens';
import { RoleSelectScreen } from '../../screens/shared/RoleSelectScreen';
import { ProfileScreen } from '../../screens/shared/ProfileScreen';
import { useAuthStore } from '../../stores/authStore';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Mock modda kimlik bilgisi doğrulanmaz; ekran onSubmit'i argüman taşımıyor.
const DEMO_CREDENTIALS = { email: 'demo@rota.app', password: 'demo1234' };

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
      onSubmit={() => register({ name: 'İpek Kılıç', ...DEMO_CREDENTIALS, role: 'customer' })}
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
        else if (key === 'privacy')
          Alert.alert('Gizlilik ve güvenlik', 'Hesap gizliliği ayarları yakında.', [{ text: 'Tamam' }]);
        else Alert.alert('Yardım ve destek', 'destek@rota.app · 0850 000 00 00', [{ text: 'Tamam' }]);
      }}
      onLogout={logout}
    />
  );
}
