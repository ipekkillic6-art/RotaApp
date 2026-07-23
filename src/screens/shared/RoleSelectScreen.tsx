import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  ChoiceCard,
  ROLE_META,
  SafeAreaContainer,
  ScreenContainer,
  ScrollContainer,
  Typography,
  useTheme,
} from '../../design-system';
import type { UserRole } from '../../types';

export interface RoleSelectScreenProps {
  value?: UserRole;
  onChange?: (role: UserRole) => void;
  onContinue?: (role: UserRole) => void;
}

const ROLES: UserRole[] = ['customer', 'courier', 'admin'];

/**
 * Role picker — demo affordance.
 *
 * A real deployment derives the role from the account, not from a screen. It
 * exists here so the three products can be compared side by side in
 * Storybook, and it doubles as the reference for the role accent colours.
 */
export function RoleSelectScreen({ value, onChange, onContinue }: RoleSelectScreenProps) {
  const theme = useTheme();
  const [internal, setInternal] = useState<UserRole>('customer');
  const selected = value ?? internal;

  const select = (role: UserRole) => {
    setInternal(role);
    onChange?.(role);
  };

  return (
    <ScreenContainer>
      <SafeAreaContainer>
        <ScrollContainer>
          <View style={{ gap: theme.spacing.sm, paddingVertical: theme.spacing['3xl'] }}>
            <Typography variant="h1">Nasıl devam edelim?</Typography>
            <Typography variant="bodySm" tone="secondary">
              Her rolün kendi arayüzü ve renk kimliği var. Demo amaçlı istediğin an
              değiştirebilirsin.
            </Typography>
          </View>

          <View style={{ gap: theme.spacing.md }} accessibilityRole="radiogroup">
            {ROLES.map((role) => (
              <ChoiceCard
                key={role}
                label={ROLE_META[role].label}
                hint={ROLE_META[role].description}
                icon={ROLE_META[role].icon}
                selected={selected === role}
                onPress={() => select(role)}
                accentColor={theme.colors.role[role]}
              />
            ))}
          </View>

          <View style={{ paddingTop: theme.spacing['2xl'] }}>
            <Button label="Devam et" onPress={() => onContinue?.(selected)} />
          </View>
        </ScrollContainer>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}
