import React, { useState } from 'react';
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
import { addresses } from '../../mocks/addresses';
import { deliveries } from '../../mocks/deliveries';
import type { PackageTypeId } from '../../types';

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
  /** Which step to render. Stories set this directly. */
  step?: CreateStepKey;
  /** Blocks progress and shows a message — used for the validation story. */
  errorText?: string;
  /** Price is still being calculated. */
  priceLoading?: boolean;
  /** Pricing failed — the summary step shows a retry. */
  priceFailed?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

/**
 * Multi-step delivery creation.
 *
 * One screen component with a `step` prop rather than seven screen files: the
 * chrome, the footer and the progress are identical across steps, and only the
 * body changes. Each step is exposed as its own Storybook story.
 */
export function CreateDeliveryScreen({
  step = 'pickup',
  errorText,
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

  const [packageType, setPackageType] = useState<PackageTypeId>('small');
  const [note, setNote] = useState('');
  const [senderPhone, setSenderPhone] = useState('532 114 22 07');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [timing, setTiming] = useState<'now' | 'scheduled'>('now');

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
          disabled={!!errorText || (step === 'price' && (priceLoading || priceFailed))}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xs }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          {step === 'pickup' && (
            <>
              <AddressField label="Alış adresi" required value="Ofis · Büyükdere Cad. No:127" />
              <Typography variant="micro" tone="muted" overline>
                Kayıtlı adresler
              </Typography>
              <AddressCard address={addresses.officeLevent} variant="saved" selected onPress={() => {}} />
              <AddressCard address={addresses.homeKadikoy} variant="saved" onPress={() => {}} />
              <AddressCard address={addresses.storeNisantasi} variant="saved" onPress={() => {}} />
            </>
          )}

          {step === 'dropoff' && (
            <>
              <AddressField label="Teslimat adresi" required placeholder="Adres seçin" />
              <TextField
                label="Kurye için not"
                placeholder="Kapı kodu, kat, bina tarifi…"
                value={note}
                onChangeText={setNote}
                multiline
                rows={3}
                maxLength={200}
                showCounter
              />
              <Typography variant="micro" tone="muted" overline>
                Kayıtlı adresler
              </Typography>
              <AddressCard address={addresses.homeKadikoy} variant="saved" onPress={() => {}} />
              <AddressCard address={addresses.warehouseTuzla} variant="saved" onPress={() => {}} />
            </>
          )}

          {step === 'package' && (
            <>
              <PackageTypeSelector value={packageType} onChange={setPackageType} />
              <TextField
                label="Paket açıklaması"
                placeholder="İçeriği kısaca tanımla"
                value={note}
                onChangeText={setNote}
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
                <PhoneField label="Telefon" value={senderPhone} onChangeText={setSenderPhone} required />
              </Surface>
              <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
                <Typography variant="micro" tone="muted" overline>
                  Alıcı
                </Typography>
                <TextField label="Ad soyad" value="" onChangeText={() => {}} icon={User} required />
                <PhoneField
                  label="Telefon"
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
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
                selected={timing === 'now'}
                onPress={() => setTiming('now')}
              />
              <ChoiceCard
                label="İleri tarihe planla"
                hint="Belirlediğin saat aralığında alınır"
                icon={Clock}
                selected={timing === 'scheduled'}
                onPress={() => setTiming('scheduled')}
              />
              {timing === 'scheduled' && (
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
                price={priceFailed ? undefined : deliveries.pending.price}
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
              <AddressCard address={addresses.officeLevent} variant="pickup" />
              <AddressCard address={addresses.homeKadikoy} variant="dropoff" />
              <PackageInfoCard type={packageType} description="A4 zarf içinde sözleşme evrakı" />
              <PriceSummary price={deliveries.pending.price} distanceKm={11.4} />
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
