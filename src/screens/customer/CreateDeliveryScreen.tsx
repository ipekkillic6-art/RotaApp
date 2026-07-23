import React from 'react';
import { View } from 'react-native';
import { ArrowRight, Clock, Info, User } from 'lucide-react-native';
import {
  AddressCard,
  AddressField,
  Button,
  ChoiceCard,
  DatePickerTrigger,
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
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { Address, PackageTypeId, PriceBreakdown } from '../../types';
import type { CreateDeliveryForm } from '../../hooks/useCreateDeliveryForm';

/** The seven steps, in order. Exported so stories can address them by name. */
export const CREATE_STEPS = [
  { key: 'pickup', title: 'Alış adresi', description: 'Paketi nereden alalım?' },
  { key: 'dropoff', title: 'Teslimat adresi', description: 'Paket nereye gidecek?' },
  { key: 'package', title: 'Paket bilgileri', description: 'Ne gönderiyorsun? Araç buna göre atanır.' },
  { key: 'contacts', title: 'Gönderici ve alıcı', description: 'Kurye kiminle iletişime geçsin?' },
  { key: 'schedule', title: 'Tarih ve saat', description: 'Hemen mi, planlı mı?' },
  { key: 'price', title: 'Fiyat özeti', description: 'Onaylamadan önce ücreti gör.' },
  { key: 'confirm', title: 'Onay', description: 'Her şey doğru mu?' },
] as const;

export type CreateStepKey = (typeof CREATE_STEPS)[number]['key'];

export interface CreateDeliveryScreenProps {
  step?: CreateStepKey;
  /** Form verisi ve seçim callback'i — hook'tan gelir (ekran saf/kontrollü). */
  form: CreateDeliveryForm;
  savedAddresses: Address[];
  onChange: (patch: Partial<CreateDeliveryForm>) => void;
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
  onChange,
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

          {step === 'confirm' && (
            <>
              {pickup && <AddressCard address={pickup} variant="pickup" />}
              {dropoff && <AddressCard address={dropoff} variant="dropoff" />}
              <PackageInfoCard
                type={form.packageType}
                description={form.packageNote.trim() || 'Paket açıklaması yok'}
              />
              <PriceSummary price={price ?? undefined} distanceKm={11.4} />
              <InlineAlert
                tone="info"
                message="Onayladığında ödeme kayıtlı kartından tahsil edilir ve kurye araması başlar."
              />
            </>
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
