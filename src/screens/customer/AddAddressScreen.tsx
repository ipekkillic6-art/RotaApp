import React from 'react';
import { View } from 'react-native';
import { Building2, MapPin, StickyNote, Tag, User } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  InlineAlert,
  PhoneField,
  ScrollContainer,
  TextField,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { AddressForm, AddressFieldKey } from '../../utils/addressValidation';

export interface AddAddressScreenProps {
  form: AddressForm;
  /** Alan bazlı doğrulama mesajları — hook'tan gelir (ekran saf). */
  errors?: Partial<Record<AddressFieldKey, string>>;
  onChange: (patch: Partial<AddressForm>) => void;
  /** false iken "Adresi kaydet" pasif. */
  canSubmit?: boolean;
  saving?: boolean;
  /** Sunucu/kaydetme hatası. */
  errorText?: string;
  onSubmit?: () => void;
  onClose?: () => void;
}

/**
 * Yeni adres formu. Zorunlu alanlar üstte (başlık + açık adres + ilçe/şehir);
 * iletişim bilgileri opsiyonel ve altta, çünkü kurye ancak teslimatta gerekir.
 */
export function AddAddressScreen({
  form,
  errors = {},
  onChange,
  canSubmit = true,
  saving = false,
  errorText,
  onSubmit,
  onClose,
}: AddAddressScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Yeni adres" onBack={onClose} />}
      footer={
        <Button
          label="Adresi kaydet"
          onPress={onSubmit}
          loading={saving}
          disabled={!canSubmit || saving}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xs }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          <TextField
            label="Başlık"
            required
            placeholder="Ev, Ofis, Depo…"
            value={form.title}
            onChangeText={(t) => onChange({ title: t })}
            icon={Tag}
            errorText={errors.title}
          />

          <TextField
            label="Açık adres"
            required
            placeholder="Mahalle, cadde, sokak, bina no, daire"
            value={form.fullAddress}
            onChangeText={(t) => onChange({ fullAddress: t })}
            icon={MapPin}
            multiline
            rows={3}
            errorText={errors.fullAddress}
            helperText="Kuryenin kapıya kadar ulaşabileceği detay ver."
          />

          <TextField
            label="İlçe"
            required
            placeholder="Kadıköy"
            value={form.district}
            onChangeText={(t) => onChange({ district: t })}
            icon={Building2}
            errorText={errors.district}
          />

          <TextField
            label="Şehir"
            required
            placeholder="İstanbul"
            value={form.city}
            onChangeText={(t) => onChange({ city: t })}
            icon={Building2}
            errorText={errors.city}
          />

          <Typography variant="micro" tone="muted" overline>
            İletişim (opsiyonel)
          </Typography>

          <TextField
            label="Ad soyad"
            placeholder="Adreste kime ulaşılacak?"
            value={form.contactName}
            onChangeText={(t) => onChange({ contactName: t })}
            icon={User}
          />

          <PhoneField
            label="Telefon"
            value={form.contactPhone}
            onChangeText={(t) => onChange({ contactPhone: t })}
            errorText={errors.contactPhone}
          />

          <TextField
            label="Kurye notu"
            placeholder="2. kat, zil çalışmıyor — arayın"
            value={form.note}
            onChangeText={(t) => onChange({ note: t })}
            icon={StickyNote}
            multiline
            rows={2}
          />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
