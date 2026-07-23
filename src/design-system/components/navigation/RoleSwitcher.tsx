import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Headset, Package, Truck, type LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import type { UserRole } from '../../../types';

export const ROLE_META: Record<
  UserRole,
  { label: string; description: string; icon: LucideIcon }
> = {
  customer: {
    label: 'Müşteri',
    description: 'Teslimat oluştur ve takip et',
    icon: Package,
  },
  courier: {
    label: 'Kurye',
    description: 'Görevleri yönet ve teslim et',
    icon: Truck,
  },
  admin: {
    label: 'Operasyon',
    description: 'Teslimatları ve kuryeleri yönet',
    icon: Headset,
  },
};

/** The accent that identifies each role throughout the app chrome. */
export function useRoleColor(role: UserRole) {
  const theme = useTheme();
  return {
    color: theme.colors.role[role],
    surface: theme.colors.roleSurface[role],
  };
}

export interface RoleSwitcherProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  /** Restricts the offered roles — most accounts only hold one. */
  roles?: UserRole[];
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      padding: 3,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background.secondary,
      alignSelf: 'flex-start',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      minHeight: 34,
    },
  });

/**
 * Compact role switch for the demo build.
 *
 * Roles are colour-coded (customer teal, courier violet, ops graphite) so the
 * chrome tells you which product you are in before you read a word. In a real
 * deployment this lives behind an account that actually holds several roles.
 */
export function RoleSwitcher({
  value,
  onChange,
  roles = ['customer', 'courier', 'admin'],
  style,
}: RoleSwitcherProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.root, style]} accessibilityRole="tablist">
      {roles.map((role) => {
        const active = role === value;
        const meta = ROLE_META[role];
        return (
          <Touchable
            key={role}
            onPress={() => onChange(role)}
            feedback="opacity"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={meta.label}
          >
            <View
              style={[
                styles.item,
                active && { backgroundColor: theme.colors.roleSurface[role] },
              ]}
            >
              <Icon
                icon={meta.icon}
                size="sm"
                color={active ? theme.colors.role[role] : theme.colors.text.muted}
              />
              <Typography
                variant="micro"
                color={active ? theme.colors.role[role] : theme.colors.text.muted}
                weight="semibold"
              >
                {meta.label}
              </Typography>
            </View>
          </Touchable>
        );
      })}
    </View>
  );
}
