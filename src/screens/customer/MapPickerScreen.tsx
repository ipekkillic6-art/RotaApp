import React from 'react';
import { View } from 'react-native';
import {
  AppHeader,
  Button,
  InlineAlert,
  MapPicker,
  Surface,
  Typography,
  useTheme,
  type LatLng,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';

export interface MapPickerScreenProps {
  initialCoord?: LatLng;
  /** Seçilen nokta adrese çevriliyor. */
  resolving?: boolean;
  onChange?: (coord: LatLng) => void;
  onConfirm?: () => void;
  onClose?: () => void;
}

/**
 * Haritadan konum seçme. Pin ekran ortasında sabit; kullanıcı haritayı
 * kaydırıp "Bu konumu seç" der, seçilen nokta reverse geocode ile adrese
 * çevrilip forma döner.
 */
export function MapPickerScreen({
  initialCoord,
  resolving = false,
  onChange,
  onConfirm,
  onClose,
}: MapPickerScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={<AppHeader title="Haritada seç" onBack={onClose} />}
      footer={
        <Button label="Bu konumu seç" onPress={onConfirm} loading={resolving} disabled={resolving} />
      }
    >
      <View style={{ flex: 1 }}>
        <MapPicker initialCoord={initialCoord} onChange={onChange} />

        {/* Harita üstünde ipucu — pini nasıl kullanacağını anlat. */}
        <View
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            left: theme.spacing.md,
            right: theme.spacing.md,
          }}
          pointerEvents="none"
        >
          <Surface tone="elevated" radius="md" padding="md" bordered>
            <Typography variant="micro" tone="secondary" align="center">
              Haritayı kaydırarak pini teslimat noktasına getir
            </Typography>
          </Surface>
        </View>

        {resolving && (
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              left: theme.spacing.md,
              right: theme.spacing.md,
            }}
            pointerEvents="none"
          >
            <InlineAlert tone="info" message="Seçilen konum adrese çevriliyor…" />
          </View>
        )}
      </View>
    </ScreenScaffold>
  );
}
