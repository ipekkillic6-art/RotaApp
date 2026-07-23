import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/shared/SplashScreen';
import { OnboardingScreen } from '../../screens/shared/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../../screens/shared/AuthScreens';
import { RoleSelectScreen } from '../../screens/shared/RoleSelectScreen';
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
      onSubmit={() => login(DEMO_CREDENTIALS)}
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
      onSubmit={() => register({ name: 'Deniz Aydın', ...DEMO_CREDENTIALS, role: 'customer' })}
    />
  );
}

export function RoleSelectContainer() {
  const setRole = useAuthStore((s) => s.setRole);
  // setRole rolü kalıcı yazar; RootNavigator o rolün tab'larına geçer.
  return <RoleSelectScreen onContinue={(role) => setRole(role)} />;
}
