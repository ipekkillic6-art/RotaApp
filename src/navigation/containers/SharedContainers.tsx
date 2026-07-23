import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SplashScreen } from '../../screens/shared/SplashScreen';
import { OnboardingScreen } from '../../screens/shared/OnboardingScreen';
import { LoginScreen, RegisterScreen } from '../../screens/shared/AuthScreens';
import { RoleSelectScreen } from '../../screens/shared/RoleSelectScreen';
import type { UserRole } from '../../types';
import type { RootStackParamList } from '../../types/navigation';
import { ROUTES } from '../routes';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Rol → o rolün tab host rotası. */
const TABS_FOR: Record<UserRole, keyof RootStackParamList> = {
  customer: ROUTES.CUSTOMER_TABS,
  courier: ROUTES.COURIER_TABS,
  admin: ROUTES.ADMIN_TABS,
};

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
  return (
    <LoginScreen
      onSubmit={() => navigation.navigate(ROUTES.ROLE_SELECT)}
      onRegister={() => navigation.navigate(ROUTES.REGISTER)}
    />
  );
}

export function RegisterContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <RegisterScreen
      onBack={() => navigation.goBack()}
      onSubmit={() => navigation.navigate(ROUTES.ROLE_SELECT)}
    />
  );
}

export function RoleSelectContainer() {
  const navigation = useNavigation<Nav>();
  return (
    <RoleSelectScreen
      onContinue={(role: UserRole) =>
        navigation.reset({ index: 0, routes: [{ name: TABS_FOR[role] }] })
      }
    />
  );
}
