import React, { useState } from 'react';
import { View } from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import {
  AppHeader,
  Divider,
  Icon,
  ScrollContainer,
  Surface,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { FaqItem } from '../../types';

export interface HelpSupportScreenProps {
  faqs: FaqItem[];
  email: string;
  phone: string;
  appVersion: string;
  onEmail?: () => void;
  onCall?: () => void;
  onLiveChat?: () => void;
  onTerms?: () => void;
  onPrivacyPolicy?: () => void;
  onBack?: () => void;
}

/**
 * Yardım ve destek. Üstte SSS (dokununca açılan cevap), altında iletişim
 * kanalları ve yasal bağlantılar. En altta uygulama sürümü.
 */
export function HelpSupportScreen({
  faqs,
  email,
  phone,
  appVersion,
  onEmail,
  onCall,
  onLiveChat,
  onTerms,
  onPrivacyPolicy,
  onBack,
}: HelpSupportScreenProps) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sectionTitle = (text: string) => (
    <Typography variant="micro" tone="muted" overline>
      {text}
    </Typography>
  );

  const contactRow = (
    icon: typeof Mail,
    label: string,
    value: string | undefined,
    onPress?: () => void,
    external = false,
  ) => (
    <Touchable
      onPress={onPress ?? (() => {})}
      feedback="opacity"
      accessibilityLabel={value ? `${label}: ${value}` : label}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Icon icon={icon} tone="secondary" />
        <View style={{ flex: 1, gap: 1 }}>
          <Typography variant="body">{label}</Typography>
          {value && (
            <Typography variant="micro" tone="muted">
              {value}
            </Typography>
          )}
        </View>
        <Icon icon={external ? ExternalLink : ChevronDown} size="sm" tone="muted" />
      </View>
    </Touchable>
  );

  return (
    <ScreenScaffold header={<AppHeader title="Yardım ve destek" onBack={onBack} />}>
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Sık sorulan sorular')}
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              {faqs.map((faq, i) => {
                const open = expandedId === faq.id;
                return (
                  <React.Fragment key={faq.id}>
                    {i > 0 && <Divider />}
                    <Touchable
                      onPress={() => setExpandedId(open ? null : faq.id)}
                      feedback="opacity"
                      accessibilityLabel={faq.question}
                      accessibilityState={{ expanded: open }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                        <Typography variant="bodyStrong" style={{ flex: 1 }}>
                          {faq.question}
                        </Typography>
                        <Icon icon={open ? ChevronUp : ChevronDown} size="sm" tone="muted" />
                      </View>
                    </Touchable>
                    {open && (
                      <Typography variant="bodySm" tone="secondary">
                        {faq.answer}
                      </Typography>
                    )}
                  </React.Fragment>
                );
              })}
            </Surface>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Bize ulaşın')}
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              {contactRow(Mail, 'E-posta', email, onEmail)}
              <Divider />
              {contactRow(Phone, 'Telefon', phone, onCall)}
              <Divider />
              {contactRow(MessageCircle, 'Canlı destek', 'Hafta içi 09:00 – 18:00', onLiveChat)}
            </Surface>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {sectionTitle('Yasal')}
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              {contactRow(FileText, 'Kullanım koşulları', undefined, onTerms, true)}
              <Divider />
              {contactRow(ShieldCheck, 'Gizlilik politikası', undefined, onPrivacyPolicy, true)}
            </Surface>
          </View>

          <Typography variant="micro" tone="muted" align="center">
            Rota v{appVersion}
          </Typography>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
