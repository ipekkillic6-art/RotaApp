import React, { useState } from 'react';
import { View } from 'react-native';
import { Mail, MailCheck } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  InlineAlert,
  ScrollContainer,
  StateView,
  TextField,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { emailError } from '../../utils/authValidation';

export interface ForgotPasswordScreenProps {
  sending?: boolean;
  /** Bağlantı gönderildi — başarı ekranı gösterilir. */
  sent?: boolean;
  errorText?: string;
  onSubmit?: (email: string) => void;
  onBack?: () => void;
}

/**
 * Şifremi unuttum. E-posta girilir, geçerliyse sıfırlama bağlantısı istenir.
 * Güvenlik gereği e-posta kayıtlı olmasa da başarı gösterilir.
 */
export function ForgotPasswordScreen({
  sending = false,
  sent = false,
  errorText,
  onSubmit,
  onBack,
}: ForgotPasswordScreenProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const localError = submitted ? emailError(email) : undefined;

  const submit = () => {
    setSubmitted(true);
    if (emailError(email)) return;
    onSubmit?.(email.trim());
  };

  if (sent) {
    return (
      <ScreenScaffold header={<AppHeader title="Şifremi unuttum" onBack={onBack} />}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <StateView
            icon={MailCheck}
            title="Bağlantı gönderildi"
            description={`${email.trim()} adresine bir şifre sıfırlama bağlantısı gönderdik. Gelen kutunu kontrol et.`}
            tone="brand"
          />
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      header={<AppHeader title="Şifremi unuttum" onBack={onBack} />}
      footer={
        <Button
          label="Sıfırlama bağlantısı gönder"
          onPress={submit}
          loading={sending}
          disabled={sending || email.trim().length === 0}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}
          <Typography variant="bodySm" tone="secondary">
            Hesabının e-posta adresini gir; şifreni sıfırlaman için bir bağlantı gönderelim.
          </Typography>
          <TextField
            label="E-posta"
            placeholder="ornek@sirket.com"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            errorText={localError}
            textContentType="username"
            autoComplete="email"
            required
          />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
