import React from 'react';
import { View } from 'react-native';
import { ChevronRight, KeyRound, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  Divider,
  Icon,
  InlineAlert,
  ScrollContainer,
  StateView,
  Surface,
  Switch,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { PrivacySettings, PrivacySettingKey } from '../../types';

interface ToggleMeta {
  key: PrivacySettingKey;
  label: string;
  description: string;
}

const SECURITY_TOGGLES: ToggleMeta[] = [
  {
    key: 'biometricLogin',
    label: 'Yüz Kimliği ile giriş',
    description: 'Uygulamayı açarken biyometrik doğrulama iste',
  },
  {
    key: 'twoFactor',
    label: 'İki adımlı doğrulama',
    description: 'Girişte SMS ile ek kod iste',
  },
];

const PRIVACY_TOGGLES: ToggleMeta[] = [
  {
    key: 'locationSharing',
    label: 'Konum paylaşımı',
    description: 'Teslimat sırasında konumunu kuryeyle paylaş',
  },
  {
    key: 'usageAnalytics',
    label: 'Kullanım verisi paylaş',
    description: 'Uygulamayı iyileştirmek için anonim analiz gönder',
  },
  {
    key: 'personalizedOffers',
    label: 'Kişiselleştirilmiş öneriler',
    description: 'İlgi alanına göre kampanya ve bildirimler',
  },
];

export interface PrivacySecurityScreenProps {
  settings?: PrivacySettings;
  loading?: boolean;
  errorText?: string;
  onToggle?: (key: PrivacySettingKey, value: boolean) => void;
  onChangePassword?: () => void;
  onLogoutAllDevices?: () => void;
  onDeleteAccount?: () => void;
  onBack?: () => void;
}

/**
 * Gizlilik ve güvenlik ayarları. Güvenlik ve gizlilik anahtarları anında
 * kaydedilir (iyimser güncelleme container'da); hesap işlemleri (şifre,
 * tüm cihazlardan çıkış, hesap silme) en altta, silme yıkıcı.
 */
export function PrivacySecurityScreen({
  settings,
  loading = false,
  errorText,
  onToggle,
  onChangePassword,
  onLogoutAllDevices,
  onDeleteAccount,
  onBack,
}: PrivacySecurityScreenProps) {
  const theme = useTheme();

  const header = <AppHeader title="Gizlilik ve güvenlik" onBack={onBack} />;

  if (!settings) {
    return (
      <ScreenScaffold header={header}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <StateView
            icon={ShieldCheck}
            title={loading ? 'Ayarlar yükleniyor' : 'Ayarlar yüklenemedi'}
            description={loading ? undefined : errorText}
          />
        </View>
      </ScreenScaffold>
    );
  }

  const sectionTitle = (text: string) => (
    <Typography variant="micro" tone="muted" overline>
      {text}
    </Typography>
  );

  const toggleList = (items: ToggleMeta[]) => (
    <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
      {items.map((item, i) => (
        <React.Fragment key={item.key}>
          {i > 0 && <Divider />}
          <Switch
            label={item.label}
            description={item.description}
            checked={settings[item.key]}
            onChange={(value) => onToggle?.(item.key, value)}
          />
        </React.Fragment>
      ))}
    </Surface>
  );

  const actionRow = (icon: typeof KeyRound, label: string, onPress?: () => void) => (
    <Touchable onPress={onPress ?? (() => {})} feedback="opacity" accessibilityLabel={label}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Icon icon={icon} tone="secondary" />
        <Typography variant="body" style={{ flex: 1 }}>
          {label}
        </Typography>
        <Icon icon={ChevronRight} size="sm" tone="muted" />
      </View>
    </Touchable>
  );

  return (
    <ScreenScaffold header={header}>
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Güvenlik')}
            {toggleList(SECURITY_TOGGLES)}
            <Surface tone="elevated" radius="lg" padding="lg" bordered>
              {actionRow(KeyRound, 'Şifreyi değiştir', onChangePassword)}
            </Surface>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Gizlilik')}
            {toggleList(PRIVACY_TOGGLES)}
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Hesap')}
            <Surface tone="elevated" radius="lg" padding="lg" bordered>
              {actionRow(LogOut, 'Tüm cihazlardan çıkış yap', onLogoutAllDevices)}
            </Surface>
            <Button
              label="Hesabımı sil"
              variant="danger"
              icon={Trash2}
              onPress={onDeleteAccount}
              accessibilityHint="Hesabın ve tüm verilerin kalıcı olarak silinir"
            />
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
