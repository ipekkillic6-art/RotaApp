import React from 'react';
import { View } from 'react-native';
import { Building2, Crosshair, MapPin, StickyNote, Tag, Trash2, User } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  Icon,
  InlineAlert,
  PhoneField,
  ScrollContainer,
  Surface,
  TextField,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import type { AddressForm, AddressFieldKey } from '../../utils/addressValidation';

export interface AddAddressScreenProps {
  form: AddressForm;
  /** Düzenleme modu: başlık ve buton metni değişir, silme görünür. */
  editing?: boolean;
  /** Alan bazlı doğrulama mesajları — hook'tan gelir (ekran saf). */
  errors?: Partial<Record<AddressFieldKey, string>>;
  onChange: (patch: Partial<AddressForm>) => void;
  /** false iken kaydet butonu pasif. */
  canSubmit?: boolean;
  saving?: boolean;
  /** Konum alınıyor (GPS + reverse geocode). */
  locating?: boolean;
  locationDenied?: boolean;
  /** Sunucu/kaydetme hatası. */
  errorText?: string;
  deleting?: boolean;
  onUseCurrentLocation?: () => void;
  onSubmit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

/**
 * Yeni adres / adres düzenleme formu. Zorunlu alanlar üstte (başlık + açık
 * adres + ilçe/şehir); iletişim opsiyonel ve altta. "Güncel konumu kullan"
 * en üstte hızlı yol; silme yalnızca düzenleme modunda ve en altta (yıkıcı).
 */
export function AddAddressScreen({
  form,
  editing = false,
  errors = {},
  onChange,
  canSubmit = true,
  saving = false,
  locating = false,
  locationDenied = false,
  errorText,
  deleting = false,
  onUseCurrentLocation,
  onSubmit,
  onDelete,
  onClose,
}: AddAddressScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title={editing ? 'Adresi düzenle' : 'Yeni adres'} onBack={onClose} />}
      footer={
        <Button
          label={editing ? 'Değişiklikleri kaydet' : 'Adresi kaydet'}
          onPress={onSubmit}
          loading={saving}
          disabled={!canSubmit || saving}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xs }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          <Surface tone="elevated" radius="lg" padding="lg" bordered>
            <Touchable
              onPress={onUseCurrentLocation ?? (() => {})}
              feedback="opacity"
              accessibilityLabel="Güncel konumu kullan"
              accessibilityHint="Konumundan adres alanlarını otomatik doldurur"
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.action.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon icon={Crosshair} size="md" tone="accent" />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Typography variant="bodyStrong">Güncel konumu kullan</Typography>
                  <Typography variant="micro" tone="muted">
                    {locating
                      ? 'Konum alınıyor…'
                      : locationDenied
                        ? 'Konum izni verilmedi — elle doldurabilirsin'
                        : 'Adres alanlarını GPS ile otomatik doldur'}
                  </Typography>
                </View>
              </View>
            </Touchable>
          </Surface>

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

          {editing && (
            <Button
              label="Adresi sil"
              variant="danger"
              icon={Trash2}
              onPress={onDelete}
              loading={deleting}
              disabled={deleting || saving}
              accessibilityHint="Bu işlem geri alınamaz"
            />
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
