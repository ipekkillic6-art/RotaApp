import React from 'react';
import { View } from 'react-native';
import { CheckCircle2, CreditCard, Plus, Trash2 } from 'lucide-react-native';
import {
  AppHeader,
  Badge,
  Button,
  Divider,
  Icon,
  InlineAlert,
  ScrollContainer,
  SkeletonList,
  StateView,
  Surface,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { brandLabel } from '../../utils/cardValidation';
import type { PaymentCard } from '../../types';

export interface PaymentMethodsScreenProps {
  cards: PaymentCard[];
  loading?: boolean;
  errorText?: string;
  onAddCard?: () => void;
  onSetDefault?: (id: string) => void;
  onRemove?: (id: string) => void;
  onBack?: () => void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Kayıtlı ödeme kartları. Kart yüzeyleri tıklanabilir değil; işlemler
 * (varsayılan yap / sil) kartın altında ayrı satırda — kural 10.
 */
export function PaymentMethodsScreen({
  cards,
  loading = false,
  errorText,
  onAddCard,
  onSetDefault,
  onRemove,
  onBack,
}: PaymentMethodsScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Ödeme yöntemlerim" onBack={onBack} />}
      footer={<Button label="Kart ekle" icon={Plus} onPress={onAddCard} />}
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          {loading && cards.length === 0 ? (
            <SkeletonList count={2} />
          ) : cards.length === 0 ? (
            <Surface tone="elevated" radius="lg" bordered>
              <StateView
                icon={CreditCard}
                title="Kayıtlı kart yok"
                description="Teslimat ücretini ödemek için bir kart ekle."
                size="compact"
              />
            </Surface>
          ) : (
            cards.map((card) => (
              <Surface
                key={card.id}
                tone="elevated"
                radius="lg"
                padding="lg"
                bordered
                style={{ gap: theme.spacing.md }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: theme.radius.md,
                      backgroundColor: theme.colors.action.secondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon icon={CreditCard} tone="accent" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                      <Typography variant="bodyStrong">{brandLabel(card.brand)}</Typography>
                      {card.isDefault && <Badge label="Varsayılan" tone="success" />}
                    </View>
                    <Typography variant="micro" tone="muted">
                      •••• {card.last4} · {pad2(card.expiryMonth)}/{String(card.expiryYear).slice(-2)}
                    </Typography>
                  </View>
                </View>

                <Divider />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
                  {!card.isDefault && (
                    <Touchable
                      onPress={() => onSetDefault?.(card.id)}
                      feedback="opacity"
                      accessibilityLabel={`${brandLabel(card.brand)} kartını varsayılan yap`}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                        <Icon icon={CheckCircle2} size="sm" tone="accent" />
                        <Typography variant="caption" tone="accent" weight="semibold">
                          Varsayılan yap
                        </Typography>
                      </View>
                    </Touchable>
                  )}
                  <Touchable
                    onPress={() => onRemove?.(card.id)}
                    feedback="opacity"
                    accessibilityLabel={`${brandLabel(card.brand)} •••• ${card.last4} kartını sil`}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                      <Icon icon={Trash2} size="sm" tone="danger" />
                      <Typography variant="caption" tone="danger" weight="semibold">
                        Sil
                      </Typography>
                    </View>
                  </Touchable>
                </View>
              </Surface>
            ))
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
