import React from 'react';
import { View } from 'react-native';
import { ArrowRight, Clock, CreditCard, Info, Plus, User } from 'lucide-react-native';
import {
  AddressCard,
  AddressField,
  Button,
  ChoiceCard,
  DatePickerTrigger,
  Icon,
  InlineAlert,
  PackageInfoCard,
  PackageTypeSelector,
  PhoneField,
  PriceSummary,
  ScrollContainer,
  StepHeader,
  Surface,
  TextField,
  TimePickerTrigger,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { brandLabel } from '../../utils/cardValidation';
import type { Address, PackageTypeId, PaymentCard, PriceBreakdown } from '../../types';
import type { CreateDeliveryForm } from '../../hooks/useCreateDeliveryForm';

const pad2 = (n: number) => String(n).padStart(2, '0');
const cardLine = (c: PaymentCard) =>
  `•••• ${c.last4} · ${pad2(c.expiryMonth)}/${String(c.expiryYear).slice(-2)}`;

/** The seven steps, in order. Exported so stories can address them by name. */
export const CREATE_STEPS = [
  { key: 'pickup', title: 'Alış adresi', description: 'Paketi nereden alalım?' },
  { key: 'dropoff', title: 'Teslimat adresi', description: 'Paket nereye gidecek?' },
  { key: 'package', title: 'Paket bilgileri', description: 'Ne gönderiyorsun? Araç buna göre atanır.' },
  { key: 'contacts', title: 'Gönderici ve alıcı', description: 'Kurye kiminle iletişime geçsin?' },
  { key: 'schedule', title: 'Tarih ve saat', description: 'Hemen mi, planlı mı?' },
  { key: 'price', title: 'Fiyat özeti', description: 'Onaylamadan önce ücreti gör.' },
  { key: 'payment', title: 'Ödeme', description: 'Hangi kartla ödeyeceksin?' },
  { key: 'confirm', title: 'Onay', description: 'Her şey doğru mu?' },
] as const;

export type CreateStepKey = (typeof CREATE_STEPS)[number]['key'];

export interface CreateDeliveryScreenProps {
  step?: CreateStepKey;
  /** Form verisi ve seçim callback'i — hook'tan gelir (ekran saf/kontrollü). */
  form: CreateDeliveryForm;
  savedAddresses: Address[];
  savedCards?: PaymentCard[];
  onChange: (patch: Partial<CreateDeliveryForm>) => void;
  onAddCard?: () => void;
  /** false iken "Devam et" pasif. */
  canProceed?: boolean;
  /** Sunucu/oluşturma hatası. */
  errorText?: string;
  price?: PriceBreakdown | null;
  priceLoading?: boolean;
  priceFailed?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

function addressLabel(a?: Address): string | undefined {
  return a ? `${a.title} · ${a.fullAddress}` : undefined;
}

/**
 * Multi-step delivery creation. Tek ekran + `step` prop'u; gövde adıma göre
 * değişir. Form state'i dışarıda (useCreateDeliveryForm) — seçimler onChange ile.
 */
export function CreateDeliveryScreen({
  step = 'pickup',
  form,
  savedAddresses,
  savedCards = [],
  onChange,
  onAddCard,
  canProceed = true,
  errorText,
  price,
  priceLoading = false,
  priceFailed = false,
  onNext,
  onBack,
  onClose,
}: CreateDeliveryScreenProps) {
  const theme = useTheme();
  const index = CREATE_STEPS.findIndex((s) => s.key === step);
  const meta = CREATE_STEPS[Math.max(0, index)];
  const isLast = index === CREATE_STEPS.length - 1;

  const pickup = savedAddresses.find((a) => a.id === form.pickupAddressId);
  const dropoff = savedAddresses.find((a) => a.id === form.dropoffAddressId);
  const dropoffOptions = savedAddresses.filter((a) => a.id !== form.pickupAddressId);
  const selectedCard = savedCards.find((c) => c.id === form.paymentCardId);

  const selectPackage = (value: PackageTypeId) => onChange({ packageType: value });

  return (
    <ScreenScaffold
      header={
        <StepHeader
          current={index + 1}
          total={CREATE_STEPS.length}
          title={meta.title}
          description={meta.description}
          onBack={index > 0 ? onBack : undefined}
          onClose={onClose}
        />
      }
      footer={
        <Button
          label={isLast ? 'Teslimatı onayla' : 'Devam et'}
          iconEnd={isLast ? undefined : ArrowRight}
          onPress={onNext}
          disabled={!canProceed}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xs }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          {step === 'pickup' && (
            <>
              <AddressField
                label="Alış adresi"
                required
                value={addressLabel(pickup)}
                placeholder="Adres seçin"
              />
              <Typography variant="micro" tone="muted" overline>
                Kayıtlı adresler
              </Typography>
              {savedAddresses.map((a) => (
                <AddressCard
                  key={a.id}
                  address={a}
                  variant="saved"
                  selected={form.pickupAddressId === a.id}
                  onPress={() => onChange({ pickupAddressId: a.id })}
                />
              ))}
            </>
          )}

          {step === 'dropoff' && (
            <>
              <AddressField
                label="Teslimat adresi"
                required
                value={addressLabel(dropoff)}
                placeholder="Adres seçin"
              />
              <Typography variant="micro" tone="muted" overline>
                Kayıtlı adresler
              </Typography>
              {dropoffOptions.map((a) => (
                <AddressCard
                  key={a.id}
                  address={a}
                  variant="saved"
                  selected={form.dropoffAddressId === a.id}
                  onPress={() => onChange({ dropoffAddressId: a.id })}
                />
              ))}
            </>
          )}

          {step === 'package' && (
            <>
              <PackageTypeSelector value={form.packageType} onChange={selectPackage} />
              <TextField
                label="Paket açıklaması"
                placeholder="İçeriği kısaca tanımla"
                value={form.packageNote}
                onChangeText={(t) => onChange({ packageNote: t })}
                helperText="Kırılabilir içerik varsa mutlaka belirt."
              />
            </>
          )}

          {step === 'contacts' && (
            <>
              <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
                <Typography variant="micro" tone="muted" overline>
                  Gönderici
                </Typography>
                <TextField label="Ad soyad" value="İpek Kılıç" onChangeText={() => {}} icon={User} />
                <PhoneField
                  label="Telefon"
                  value={form.senderPhone}
                  onChangeText={(t) => onChange({ senderPhone: t })}
                  required
                />
              </Surface>
              <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
                <Typography variant="micro" tone="muted" overline>
                  Alıcı
                </Typography>
                <TextField
                  label="Ad soyad"
                  value={form.recipientName}
                  onChangeText={(t) => onChange({ recipientName: t })}
                  icon={User}
                  required
                />
                <PhoneField
                  label="Telefon"
                  value={form.recipientPhone}
                  onChangeText={(t) => onChange({ recipientPhone: t })}
                  required
                  helperText="Teslimat kodu bu numaraya gönderilir."
                />
              </Surface>
            </>
          )}

          {step === 'schedule' && (
            <>
              <ChoiceCard
                label="Hemen gönder"
                hint="Kurye ataması anında başlar"
                icon={Clock}
                selected={form.timing === 'now'}
                onPress={() => onChange({ timing: 'now' })}
              />
              <ChoiceCard
                label="İleri tarihe planla"
                hint="Belirlediğin saat aralığında alınır"
                icon={Clock}
                selected={form.timing === 'scheduled'}
                onPress={() => onChange({ timing: 'scheduled' })}
              />
              {form.timing === 'scheduled' && (
                <>
                  <DatePickerTrigger label="Tarih" required value="22 Temmuz Salı" />
                  <TimePickerTrigger label="Saat aralığı" required value="16:00 – 18:00" />
                </>
              )}
            </>
          )}

          {step === 'price' && (
            <>
              <PriceSummary
                price={priceFailed ? undefined : price ?? undefined}
                distanceKm={11.4}
                loading={priceLoading}
                onRetry={() => {}}
              />
              {!priceLoading && !priceFailed && (
                <InlineAlert
                  tone="info"
                  icon={Info}
                  message="Ücret, gerçek mesafeye göre teslimat sonunda güncellenebilir."
                />
              )}
            </>
          )}

          {step === 'payment' && (
            <>
              <Typography variant="micro" tone="muted" overline>
                Kayıtlı kartlar
              </Typography>
              {savedCards.length === 0 ? (
                <InlineAlert
                  tone="info"
                  message="Kayıtlı kartın yok. Ödemek için bir kart ekle."
                />
              ) : (
                savedCards.map((card) => (
                  <ChoiceCard
                    key={card.id}
                    label={`${brandLabel(card.brand)}  ${cardLine(card)}`}
                    hint={card.holderName}
                    icon={CreditCard}
                    selected={form.paymentCardId === card.id}
                    onPress={() => onChange({ paymentCardId: card.id })}
                  />
                ))
              )}
              <Touchable
                onPress={onAddCard ?? (() => {})}
                feedback="opacity"
                accessibilityLabel="Yeni kart ekle"
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    paddingVertical: theme.spacing.sm,
                  }}
                >
                  <Icon icon={Plus} size="sm" tone="accent" />
                  <Typography variant="caption" tone="accent" weight="semibold">
                    Yeni kart ekle
                  </Typography>
                </View>
              </Touchable>
            </>
          )}

          {step === 'confirm' && (
            <>
              {pickup && <AddressCard address={pickup} variant="pickup" />}
              {dropoff && <AddressCard address={dropoff} variant="dropoff" />}
              <PackageInfoCard
                type={form.packageType}
                description={form.packageNote.trim() || 'Paket açıklaması yok'}
              />
              <PriceSummary price={price ?? undefined} distanceKm={11.4} />
              {selectedCard && (
                <Surface tone="elevated" radius="lg" padding="lg" bordered>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Icon icon={CreditCard} tone="accent" />
                    <View style={{ flex: 1, gap: 1 }}>
                      <Typography variant="bodyStrong">{brandLabel(selectedCard.brand)}</Typography>
                      <Typography variant="micro" tone="muted">
                        {cardLine(selectedCard)}
                      </Typography>
                    </View>
                  </View>
                </Surface>
              )}
              <InlineAlert
                tone="info"
                message={
                  selectedCard
                    ? `Onayladığında ödeme •••• ${selectedCard.last4} kartından tahsil edilir ve kurye araması başlar.`
                    : 'Onayladığında ödeme kayıtlı kartından tahsil edilir ve kurye araması başlar.'
                }
              />
            </>
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
