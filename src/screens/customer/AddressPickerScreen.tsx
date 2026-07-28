import React, { useState } from 'react';
import { View } from 'react-native';
import { Crosshair, Map as MapIcon, Plus } from 'lucide-react-native';
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
import { savedAddresses as defaultSavedAddresses, addressSuggestions } from '../../mocks/addresses';
import { coordOf } from '../../utils/geo';
import type { Address } from '../../types';

export interface AddressPickerScreenProps {
  title?: string;
  /**
   * `picker`: bir adres seçilip onaylanır (alt buton). `book`: adres defteri —
   * onay butonu yoktur, satıra dokunmak adresi düzenlemeye açar.
   */
  mode?: 'picker' | 'book';
  /** Pre-fills the query — the "results" and "no results" stories use this. */
  query?: string;
  /** Overrides the results list. Empty array renders the no-results state. */
  results?: Address[];
  /** Kayıtlı adresler — container store'dan geçirir; yoksa mock kullanılır. */
  savedAddresses?: Address[];
  locationPermission?: 'granted' | 'denied' | 'undetermined';
  /** Konum alınıyor (GPS + reverse geocode). */
  locating?: boolean;
  onUseCurrentLocation?: () => void;
  /** Haritadan konum seç. */
  onPickOnMap?: () => void;
  /** Konum izni iste (izin reddedilmiş durumda haritada gösterilir). */
  onRequestLocationPermission?: () => void;
  /** Yeni adres formunu aç. */
  onAddAddress?: () => void;
  /** Kayıtlı bir adresi düzenle (kart üzerindeki kalem). */
  onEditAddress?: (address: Address) => void;
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
  mode = 'picker',
  query: initialQuery = '',
  results,
  savedAddresses = defaultSavedAddresses,
  locationPermission = 'granted',
  locating = false,
  onUseCurrentLocation,
  onPickOnMap,
  onRequestLocationPermission,
  onAddAddress,
  onEditAddress,
  onSelect,
  onClose,
}: AddressPickerScreenProps) {
  const theme = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string>();

  // Arama havuzu: kayıtlı adresler + ek öneriler (id'ye göre tekilleştirilir).
  const searchPool = [
    ...savedAddresses,
    ...addressSuggestions.filter((s) => !savedAddresses.some((a) => a.id === s.id)),
  ];

  const list =
    results ??
    (query
      ? searchPool.filter((a) =>
          `${a.title} ${a.fullAddress} ${a.district}`
            .toLocaleLowerCase('tr')
            .includes(query.toLocaleLowerCase('tr')),
        )
      : savedAddresses);

  const shortcut = (
    icon: typeof Crosshair,
    label: string,
    hint: string,
    onPress?: () => void,
  ) => (
    <Touchable onPress={onPress ?? (() => {})} feedback="opacity" accessibilityLabel={label}>
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
        // Onay butonu yalnızca seçim modunda; adres defterinde işlevi yok.
        mode === 'picker' ? (
          <Button
            label="Bu adresi kullan"
            onPress={() => {
              const chosen = list.find((a) => a.id === selectedId);
              if (chosen) onSelect?.(chosen);
            }}
            disabled={!selectedId}
          />
        ) : undefined
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <MapPreview
            height={160}
            // Burada bir rota yok; listedeki ilk adres tek işaret olarak
            // gösterilir. Koordinat yoksa bileşen kendi varsayılanına düşer.
            pickup={coordOf(list[0])}
            caption={locationPermission === 'denied' ? undefined : 'Haritada seç'}
            permissionDenied={locationPermission === 'denied'}
            onRequestPermission={onRequestLocationPermission}
            onPress={locationPermission === 'denied' ? undefined : onPickOnMap}
          />

          <Surface tone="elevated" radius="lg" padding="lg" bordered>
            {shortcut(
              Crosshair,
              'Güncel konumu kullan',
              locating ? 'Konum alınıyor…' : 'GPS ile otomatik doldur',
              onUseCurrentLocation,
            )}
            <Divider />
            {shortcut(
              MapIcon,
              'Haritada seç',
              'Haritayı kaydırarak pini konuma getir',
              onPickOnMap,
            )}
            <Divider />
            {shortcut(Plus, 'Yeni adres ekle', 'Elle yeni bir adres tanımla', onAddAddress)}
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
                  selected={mode === 'picker' && selectedId === address.id}
                  // Defterde satır düzenlemeyi açar; seçim modunda seçimi kurar.
                  onPress={
                    mode === 'book'
                      ? onEditAddress
                        ? () => onEditAddress(address)
                        : undefined
                      : () => setSelectedId(address.id)
                  }
                  onEdit={onEditAddress ? () => onEditAddress(address) : undefined}
                />
              ))
            )}
          </View>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
