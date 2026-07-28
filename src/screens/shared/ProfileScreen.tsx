import { View } from 'react-native';
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Shield,
  Sparkles,
} from 'lucide-react-native';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  Icon,
  Surface,
  Touchable,
  Typography,
  useTheme,
  ROLE_META,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { UserRole } from '../../types';

export type ProfileMenuKey =
  | 'addresses'
  | 'membership'
  | 'payment'
  | 'notifications'
  | 'privacy'
  | 'help';

export interface ProfileScreenProps {
  userName: string;
  email?: string;
  role: UserRole;
  onSelectItem?: (key: ProfileMenuKey) => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

/** `roles` verilmeyen satır her rolde görünür. */
const MENU: Array<{
  key: ProfileMenuKey;
  icon: typeof MapPin;
  label: string;
  roles?: UserRole[];
}> = [
  { key: 'addresses', icon: MapPin, label: 'Adreslerim' },
  // Rota Plus teslimat ücretine bağlı bir avantaj paketi — yalnızca müşteride.
  { key: 'membership', icon: Sparkles, label: 'Rota Plus üyeliğim', roles: ['customer'] },
  { key: 'payment', icon: CreditCard, label: 'Ödeme yöntemlerim' },
  { key: 'notifications', icon: Bell, label: 'Bildirim ayarları' },
  { key: 'privacy', icon: Shield, label: 'Gizlilik ve güvenlik' },
  { key: 'help', icon: HelpCircle, label: 'Yardım ve destek' },
];

/**
 * Profil — her rolün "Profil" sekmesi.
 *
 * Kullanıcı kimliği + rol rozeti + ayar menüsü + çıkış. Çıkış authStore.logout'u
 * çağırır; oturum temizlenince RootNavigator otomatik olarak giriş akışına döner.
 */
export function ProfileScreen({ userName, email, role, onSelectItem, onLogout, loggingOut = false }: ProfileScreenProps) {
  const theme = useTheme();
  const meta = ROLE_META[role];
  const menu = MENU.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <ScreenScaffold role={role} activeTab="profile" header={<AppHeader title="Profil" variant="large" />}>
      <View style={{ flex: 1, paddingHorizontal: theme.layout.screenPaddingX, gap: theme.spacing.lg }}>
        <Surface
          style={{
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.xl,
          }}
        >
          <Avatar name={userName} size="xl" />
          <Typography variant="h2">{userName}</Typography>
          {email ? (
            <Typography variant="bodySm" tone="secondary">
              {email}
            </Typography>
          ) : null}
          <Badge label={meta.label} icon={meta.icon} />
        </Surface>

        <Surface>
          {menu.map((item, i) => (
            <Touchable
              key={item.label}
              onPress={() => onSelectItem?.(item.key)}
              feedback="opacity"
              accessibilityLabel={item.label}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  padding: theme.spacing.md,
                  borderTopWidth: i === 0 ? 0 : theme.borderWidth.hairline,
                  borderTopColor: theme.colors.border.subtle,
                }}
              >
                <Icon icon={item.icon} tone="secondary" />
                <Typography variant="body" style={{ flex: 1 }}>
                  {item.label}
                </Typography>
                <Icon icon={ChevronRight} size="sm" tone="muted" />
              </View>
            </Touchable>
          ))}
        </Surface>

        <Button
          label="Çıkış yap"
          icon={LogOut}
          variant="secondary"
          loading={loggingOut}
          onPress={onLogout}
        />
      </View>
    </ScreenScaffold>
  );
}
