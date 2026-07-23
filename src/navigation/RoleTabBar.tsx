import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar as DesignTabBar, useTheme } from '../design-system';
import type { UserRole } from '../types';
import { ROLE_TABS } from '../screens/_shared/ScreenScaffold';

/**
 * React Navigation'ın `tabBar` prop'u için tasarım sistemindeki BottomTabBar.
 *
 * ÖNEMLİ: `tabBar` prop'u bir FONKSİYON olarak çağrılır, bileşen olarak mount
 * EDİLMEZ. Bu yüzden hook kullanan tab bar'ı JSX ile mount etmemiz gerekir:
 *   tabBar={(props) => <RoleTabBar role="customer" {...props} />}
 * (makeRoleTabBar bunu döndürür.)
 */
export interface RoleTabBarProps extends BottomTabBarProps {
  role: UserRole;
}

export function RoleTabBar({ role, state, navigation }: RoleTabBarProps) {
  const theme = useTheme();
  const activeKey = state.routes[state.index]?.name ?? ROLE_TABS[role][0].key;

  return (
    <DesignTabBar
      tabs={ROLE_TABS[role]}
      activeKey={activeKey}
      onChange={(key) => navigation.navigate(key as never)}
      accentColor={theme.colors.role[role]}
    />
  );
}

/** Tab.Navigator'ın `tabBar` prop'una verilecek render fonksiyonu. */
export function makeRoleTabBar(role: UserRole) {
  return (props: BottomTabBarProps) => <RoleTabBar role={role} {...props} />;
}
