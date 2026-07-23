import React, { useState } from 'react';
import { View } from 'react-native';
import { Crosshair, Map as MapIcon } from 'lucide-react-native';
import {
  AddressCard,
  AppHeader,
  Button,
  Divider,
  Icon,
  MapPreview,
  ScrollContainer,
  SearchField,
  StateView,
  STATE_PRESETS,
  Surface,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { savedAddresses, addressSuggestions } from '../../mocks/addresses';
import type { Address } from '../../types';

export interface AddressPickerScreenProps {
  title?: string;
  /** Pre-fills the query — the "results" and "no results" stories use this. */
  query?: string;
  /** Overrides the results list. Empty array renders the no-results state. */
  results?: Address[];
  locationPermission?: 'granted' | 'denied';
  onSelect?: (address: Address) => void;
  onClose?: () => void;
}

/**
 * Address picker.
 *
 * "Use my location" and "pick on map" sit above the saved list because they
 * are the fast paths; typing an address is the fallback, not the default.
 */
export function AddressPickerScreen({
  title = 'Adres seç',
  query: initialQuery = '',
  results,
  locationPermission = 'granted',
  onSelect,
  onClose,
}: AddressPickerScreenProps) {
  const theme = useTheme();
  const [query, setQuery] = useState(initialQuery);

  const list =
    results ??
    (query
      ? addressSuggestions.filter((a) =>
          `${a.title} ${a.fullAddress} ${a.district}`
            .toLocaleLowerCase('tr')
            .includes(query.toLocaleLowerCase('tr')),
        )
      : savedAddresses);

  const shortcut = (icon: typeof Crosshair, label: string, hint: string) => (
    <Touchable onPress={() => {}} feedback="opacity" accessibilityLabel={label}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        }}
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
          <Icon icon={icon} size="md" tone="accent" />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Typography variant="bodyStrong">{label}</Typography>
          <Typography variant="micro" tone="muted">
            {hint}
          </Typography>
        </View>
      </View>
    </Touchable>
  );

  return (
    <ScreenScaffold
      header={
        <AppHeader
          onBack={onClose}
          center={
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Mahalle, cadde veya bina ara"
            />
          }
        />
      }
      footer={
        <Button
          label="Bu adresi kullan"
          onPress={() => onSelect?.(list[0] ?? savedAddresses[0])}
          disabled={list.length === 0}
        />
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <MapPreview
            height={160}
            caption={locationPermission === 'granted' ? 'Haritada seç' : undefined}
            permissionDenied={locationPermission === 'denied'}
            onRequestPermission={() => {}}
            onPress={locationPermission === 'granted' ? () => {} : undefined}
          />

          <Surface tone="elevated" radius="lg" padding="lg" bordered>
            {shortcut(Crosshair, 'Güncel konumu kullan', 'GPS ile otomatik doldur')}
            <Divider />
            {shortcut(MapIcon, 'Haritada seç', 'Pini sürükleyerek tam nokta belirle')}
          </Surface>

          <View style={{ gap: theme.spacing.md }}>
            <Typography variant="micro" tone="muted" overline>
              {query ? 'Sonuçlar' : 'Kayıtlı adresler'}
            </Typography>

            {list.length === 0 ? (
              <Surface tone="elevated" radius="lg" bordered>
                <StateView {...STATE_PRESETS.noSearchResults} size="compact" />
              </Surface>
            ) : (
              list.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  variant="saved"
                  onPress={() => onSelect?.(address)}
                  onEdit={() => {}}
                />
              ))
            )}
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
