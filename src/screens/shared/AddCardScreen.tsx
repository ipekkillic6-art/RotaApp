import React from 'react';
import { View } from 'react-native';
import { CreditCard, Lock, User } from 'lucide-react-native';
import {
  AppHeader,
  Button,
  InlineAlert,
  ScrollContainer,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import {
  brandLabel,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  type CardFieldKey,
  type CardForm,
} from '../../utils/cardValidation';
import type { CardBrand } from '../../types';

export interface AddCardScreenProps {
  form: CardForm;
  brand: CardBrand;
  errors?: Partial<Record<CardFieldKey, string>>;
  canSubmit?: boolean;
  saving?: boolean;
  makeDefault?: boolean;
  errorText?: string;
  onChange: (patch: Partial<CardForm>) => void;
  onToggleDefault?: (value: boolean) => void;
  onSubmit?: () => void;
  onClose?: () => void;
}

/**
 * Kart ekleme formu. Numara girildikçe biçimlenir ve marka algılanır. Tam
 * numara yalnızca formda kalır; kaydederken son 4 hane + marka saklanır.
 */
export function AddCardScreen({
  form,
  brand,
  errors = {},
  canSubmit = true,
  saving = false,
  makeDefault = false,
  errorText,
  onChange,
  onToggleDefault,
  onSubmit,
  onClose,
}: AddCardScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Kart ekle" onBack={onClose} />}
      footer={
        <Button label="Kartı kaydet" onPress={onSubmit} loading={saving} disabled={!canSubmit || saving} />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xs }}>
          {errorText && <InlineAlert tone="error" message={errorText} />}

          <TextField
            label="Kart numarası"
            required
            placeholder="0000 0000 0000 0000"
            value={form.number}
            onChangeText={(t) => onChange({ number: formatCardNumber(digitsOnly(t).slice(0, 16)) })}
            keyboardType="number-pad"
            maxLength={19}
            icon={CreditCard}
            errorText={errors.number}
            trailing={
              brand !== 'unknown' ? (
                <Typography variant="micro" tone="muted">
                  {brandLabel(brand)}
                </Typography>
              ) : undefined
            }
          />

          <TextField
            label="Kart üzerindeki isim"
            required
            placeholder="Ad Soyad"
            value={form.holder}
            onChangeText={(t) => onChange({ holder: t })}
            autoCapitalize="characters"
            icon={User}
            errorText={errors.holder}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Son kullanma"
                required
                placeholder="AA/YY"
                value={form.expiry}
                onChangeText={(t) => onChange({ expiry: formatExpiry(t) })}
                keyboardType="number-pad"
                maxLength={5}
                errorText={errors.expiry}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="CVV"
                required
                placeholder="123"
                value={form.cvv}
                onChangeText={(t) => onChange({ cvv: digitsOnly(t).slice(0, 4) })}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                icon={Lock}
                errorText={errors.cvv}
              />
            </View>
          </View>

          <Switch
            label="Bu kartı varsayılan yap"
            description="Yeni teslimatlarda ödeme bu karttan alınır"
            checked={makeDefault}
            onChange={(v) => onToggleDefault?.(v)}
          />

          <InlineAlert
            tone="info"
            message="Kart bilgilerin güvenle işlenir; uygulamada yalnızca son 4 hane saklanır."
          />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
