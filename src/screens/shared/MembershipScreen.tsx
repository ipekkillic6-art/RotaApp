import React, { useState } from 'react';
import { View } from 'react-native';
import { Check, CreditCard, Sparkles } from 'lucide-react-native';
import {
  AppHeader,
  Badge,
  Button,
  ChoiceCard,
  ConfirmationDialog,
  Divider,
  Icon,
  InlineAlert,
  Price,
  ScrollContainer,
  SkeletonList,
  StateView,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { formatDateWithYear, formatPrice } from '../../utils/format';
import { savingPercent } from '../../utils/membership';
import type { Membership, MembershipPlan, MembershipPlanId, PaymentCard } from '../../types';

export interface MembershipScreenProps {
  plans: MembershipPlan[];
  membership: Membership;
  /** Tahsilatın yapılacağı varsayılan kart — yoksa kart ekleme istenir. */
  defaultCard?: PaymentCard;
  loading?: boolean;
  saving?: boolean;
  errorText?: string;
  onSubscribe?: (planId: MembershipPlanId) => void;
  onCancel?: () => void;
  onAddCard?: () => void;
  onBack?: () => void;
}

/**
 * Rota Plus üyeliği.
 *
 * Üyelik yokken plan seçimi + satın alma, üyelik varken durum + iptal
 * gösterir. İptal geri alınamaz bir işlem olduğu için onay diyaloğundan
 * geçer — kural: yıkıcı işlem tek dokunuşla olmaz.
 */
export function MembershipScreen({
  plans,
  membership,
  defaultCard,
  loading = false,
  saving = false,
  errorText,
  onSubscribe,
  onCancel,
  onAddCard,
  onBack,
}: MembershipScreenProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<MembershipPlanId>('yearly');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isActive = membership.status === 'active';
  const isCancelled = membership.status === 'cancelled';
  const hasMembership = isActive || isCancelled;
  const currentPlan = plans.find((p) => p.id === membership.planId);

  const monthlyPlan = plans.find((p) => p.id === 'monthly');
  const yearlyPlan = plans.find((p) => p.id === 'yearly');
  const saving_ =
    monthlyPlan && yearlyPlan ? savingPercent(monthlyPlan, yearlyPlan) : 0;

  // Avantaj listesi seçili plandan; üyelik varsa mevcut plandan gelir.
  const benefits = (hasMembership ? currentPlan : plans.find((p) => p.id === selected))?.benefits ?? [];

  const footer = hasMembership ? (
    isActive ? (
      <Button
        label="Üyeliği iptal et"
        variant="tertiary"
        loading={saving}
        onPress={() => setConfirmCancel(true)}
      />
    ) : undefined
  ) : defaultCard ? (
    <Button
      label="Üyeliği başlat"
      loading={saving}
      disabled={plans.length === 0}
      onPress={() => onSubscribe?.(selected)}
    />
  ) : (
    <Button label="Önce kart ekle" icon={CreditCard} variant="secondary" onPress={onAddCard} />
  );

  return (
    <ScreenScaffold header={<AppHeader title="Rota Plus" onBack={onBack} />} footer={footer}>
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          {loading && plans.length === 0 ? (
            <SkeletonList count={2} />
          ) : (
            <>
              {/* Durum kartı — üyelik varsa. */}
              {hasMembership && (
                <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
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
                      <Icon icon={Sparkles} tone="accent" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        <Typography variant="bodyStrong">
                          {currentPlan ? `Rota Plus · ${currentPlan.name}` : 'Rota Plus'}
                        </Typography>
                        <Badge
                          label={isActive ? 'Aktif' : 'İptal edildi'}
                          tone={isActive ? 'success' : 'warning'}
                        />
                      </View>
                      <Typography variant="micro" tone="muted">
                        {isActive && membership.renewsAt
                          ? `${formatDateWithYear(membership.renewsAt)} tarihinde yenilenecek`
                          : isCancelled && membership.endsAt
                            ? `Avantajlar ${formatDateWithYear(membership.endsAt)} tarihine kadar sürüyor`
                            : 'Üyelik bilgisi'}
                      </Typography>
                    </View>
                  </View>

                  {defaultCard && isActive && (
                    <>
                      <Divider />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        <Icon icon={CreditCard} size="sm" tone="muted" />
                        <Typography variant="micro" tone="muted">
                          •••• {defaultCard.last4} kartından tahsil edilir
                        </Typography>
                      </View>
                    </>
                  )}
                </Surface>
              )}

              {/* Plan seçimi — yalnızca üyelik yokken. */}
              {!hasMembership && (
                <View style={{ gap: theme.spacing.md }}>
                  <Typography variant="h3">Planını seç</Typography>
                  {plans.map((plan) => (
                    <ChoiceCard
                      key={plan.id}
                      layout="row"
                      label={plan.name}
                      hint={
                        plan.period === 'year'
                          ? `Ayda ${formatPrice(plan.monthlyEquivalent)} · %${saving_} tasarruf`
                          : 'Aylık yenilenir'
                      }
                      trailingLabel={formatPrice(plan.price, { compact: true })}
                      selected={selected === plan.id}
                      onPress={() => setSelected(plan.id)}
                    />
                  ))}
                </View>
              )}

              {/* Avantajlar. */}
              {benefits.length > 0 && (
                <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
                  <Typography variant="bodyStrong">Üyelik avantajları</Typography>
                  <View style={{ gap: theme.spacing.sm }}>
                    {benefits.map((benefit) => (
                      <View
                        key={benefit}
                        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}
                      >
                        <Icon icon={Check} size="sm" tone="success" />
                        <Typography variant="bodySm" style={{ flex: 1 }}>
                          {benefit}
                        </Typography>
                      </View>
                    ))}
                  </View>
                </Surface>
              )}

              {/* Ödeme kartı uyarısı — üyelik yokken ve kart yokken. */}
              {!hasMembership && !defaultCard && !loading && (
                <Surface tone="elevated" radius="lg" bordered>
                  <StateView
                    icon={CreditCard}
                    title="Kayıtlı kart yok"
                    description="Üyelik ücretini tahsil edebilmemiz için önce bir kart eklemelisin."
                    size="compact"
                  />
                </Surface>
              )}

              {/* Toplam — plan seçiliyken. */}
              {!hasMembership && defaultCard && (
                <Surface tone="elevated" radius="lg" padding="lg" bordered>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="bodyStrong">Bugün ödenecek</Typography>
                    <Price amount={plans.find((p) => p.id === selected)?.price} size="lg" />
                  </View>
                </Surface>
              )}
            </>
          )}
        </View>
      </ScrollContainer>

      <ConfirmationDialog
        visible={confirmCancel}
        title="Üyeliği iptal et"
        message={
          membership.renewsAt
            ? `Avantajların ${formatDateWithYear(membership.renewsAt)} tarihine kadar sürecek, sonrasında yenilenmeyecek.`
            : 'Avantajların ödediğin dönemin sonuna kadar sürecek, sonrasında yenilenmeyecek.'
        }
        confirmLabel="Üyeliği iptal et"
        cancelLabel="Vazgeç"
        destructive
        loading={saving}
        onConfirm={() => {
          setConfirmCancel(false);
          onCancel?.();
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </ScreenScaffold>
  );
}
