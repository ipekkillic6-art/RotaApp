import React from 'react';
import { View } from 'react-native';
import { Lock } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  InlineAlert,
  ScrollContainer,
  TextField,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { ChangePasswordForm, ChangePasswordField } from '../../utils/authValidation';

export interface ChangePasswordScreenProps {
  form: ChangePasswordForm;
  errors?: Partial<Record<ChangePasswordField, string>>;
  saving?: boolean;
  errorText?: string;
  onChange: (patch: Partial<ChangePasswordForm>) => void;
  onSubmit?: () => void;
  onBack?: () => void;
}

/** Şifre değiştirme: mevcut şifre + yeni şifre (kural kontrollü) + tekrar. */
export function ChangePasswordScreen({
  form,
  errors = {},
  saving = false,
  errorText,
  onChange,
  onSubmit,
  onBack,
}: ChangePasswordScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Şifreyi değiştir" onBack={onBack} />}
      footer={<Button label="Şifreyi güncelle" onPress={onSubmit} loading={saving} disabled={saving} />}
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}
          <TextField
            label="Mevcut şifre"
            placeholder="••••••••"
            icon={Lock}
            value={form.current}
            onChangeText={(t) => onChange({ current: t })}
            secureTextEntry
            errorText={errors.current}
            textContentType="password"
            autoComplete="current-password"
            required
          />
          <TextField
            label="Yeni şifre"
            placeholder="En az 8 karakter"
            icon={Lock}
            value={form.next}
            onChangeText={(t) => onChange({ next: t })}
            secureTextEntry
            errorText={errors.next}
            helperText={errors.next ? undefined : 'En az 8 karakter, bir rakam içermeli.'}
            textContentType="newPassword"
            autoComplete="new-password"
            required
          />
          <TextField
            label="Yeni şifre (tekrar)"
            placeholder="••••••••"
            icon={Lock}
            value={form.confirm}
            onChangeText={(t) => onChange({ confirm: t })}
            secureTextEntry
            errorText={errors.confirm}
            textContentType="newPassword"
            autoComplete="new-password"
            required
          />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
