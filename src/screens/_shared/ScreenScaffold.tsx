import React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  Package,
  Truck,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';
import {
  OfflineBanner,
  SafeAreaContainer,
  ScreenContainer,
  useTheme,
  type TabItem,
} from '../../design-system';
import { useQueueStore } from '../../stores/queueStore';
import type { UserRole } from '../../types';

/**
 * Common shell for every screen story.
 *
 * Screens themselves stay presentational — they receive data and callbacks and
 * render. This scaffold owns the parts that are identical everywhere: safe
 * areas, the canvas, the offline banner slot and the role-coloured tab bar.
 */

export const ROLE_TABS: Record<UserRole, TabItem[]> = {
  customer: [
    { key: 'home', label: 'Ana sayfa', icon: Home },
    { key: 'deliveries', label: 'Teslimatlar', icon: Package },
    { key: 'notifications', label: 'Bildirim', icon: Bell },
    { key: 'profile', label: 'Profil', icon: User },
  ],
  courier: [
    { key: 'home', label: 'Ana sayfa', icon: Home },
    { key: 'tasks', label: 'Görevler', icon: ClipboardList },
    { key: 'earnings', label: 'Kazanç', icon: Wallet },
    { key: 'profile', label: 'Profil', icon: User },
  ],
  admin: [
    { key: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { key: 'deliveries', label: 'Teslimat', icon: Truck },
    { key: 'couriers', label: 'Kuryeler', icon: Users },
    { key: 'profile', label: 'Profil', icon: User },
  ],
};

export interface ScreenScaffoldProps {
  children: React.ReactNode;
  /** Fixed header, rendered inside the safe area. */
  header?: React.ReactNode;
  /** Role drives the tab set and the accent colour of the active tab. */
  role?: UserRole;
  /** Omit to render a screen without bottom navigation (modals, flows). */
  activeTab?: string;
  onTabChange?: (key: string) => void;
  /** Docked action bar above the tab bar — "Devam et", "Görevi kabul et". */
  footer?: React.ReactNode;
  offline?: boolean;
  tone?: 'canvas' | 'sunken';
  style?: StyleProp<ViewStyle>;
}

export function ScreenScaffold({
  children,
  header,
  role = 'customer',
  activeTab,
  onTabChange,
  footer,
  offline = false,
  tone = 'canvas',
  style,
}: ScreenScaffoldProps) {
  const theme = useTheme();
  const showTabs = !!activeTab;
  const queuedCount = useQueueStore((s) => s.count);
  const flushQueue = useQueueStore((s) => s.flush);

  return (
    <ScreenContainer tone={tone} style={style}>
      <SafeAreaContainer edges={showTabs ? ['top'] : ['top', 'bottom']}>
        {offline && <OfflineBanner queuedCount={queuedCount} onRetry={flushQueue} />}
        {header}
        <View style={{ flex: 1 }}>{children}</View>

        {footer && (
          <View
            style={{
              paddingHorizontal: theme.layout.screenPaddingX,
              paddingTop: theme.spacing.md,
              paddingBottom: showTabs ? theme.spacing.md : 0,
              gap: theme.spacing.sm,
              borderTopWidth: theme.borderWidth.hairline,
              borderTopColor: theme.colors.border.subtle,
              backgroundColor: theme.colors.background.elevated,
            }}
          >
            {footer}
          </View>
        )}
      </SafeAreaContainer>
      {/* Tab bar'ı artık navigator çiziyor (bkz. src/navigation/RoleTabBar).
          Scaffold sadece safe area + canvas + offline + header + footer.
          `activeTab` yalnızca alt kenar boşluğunu (tab alanı) ayarlamak için. */}
    </ScreenContainer>
  );
}

/** Shared story parameters for every screen story. */
export const screenStoryParams = {
  layout: 'fullscreen' as const,
};
