import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapPickerProps {
  /** Başlangıç konumu; verilmezse İstanbul merkez. */
  initialCoord?: LatLng;
  /** Harita durduğunda merkez koordinatı bildirir. */
  onChange?: (coord: LatLng) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * İstanbul (Sultanahmet civarı) — başlangıç konumu yoksa haritanın merkezi.
 *
 * Dışa açık: çağıran taraf, kullanıcı haritayı hiç kaydırmadan onaylarsa aynı
 * noktaya geri düşebilsin diye bu değeri bilmek zorunda.
 */
export const DEFAULT_MAP_COORD: LatLng = { latitude: 41.0082, longitude: 28.9784 };

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, overflow: 'hidden', backgroundColor: theme.colors.map.canvas },
    pinWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      // Pin ucu tam merkeze denk gelsin diye ikonu yukarı kaydır.
      paddingBottom: 32,
    },
  });

/**
 * Konum seçici harita. Pin ekranın ortasında sabit durur; kullanıcı haritayı
 * altında kaydırır, `onRegionChangeComplete` merkez koordinatı bildirir —
 * sürüklenebilir marker'a göre daha stabil ve tek elle kullanılabilir.
 *
 * iOS'ta Apple Maps (anahtar gerektirmez), Android'de Google Maps.
 */
export function MapPicker({ initialCoord = DEFAULT_MAP_COORD, onChange, style }: MapPickerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const region = useMemo<Region>(
    () => ({ ...initialCoord, latitudeDelta: 0.012, longitudeDelta: 0.012 }),
    [initialCoord],
  );

  return (
    <View style={[styles.root, style]} accessibilityLabel="Konum seçme haritası">
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(r) =>
          onChange?.({ latitude: r.latitude, longitude: r.longitude })
        }
      />
      <View style={styles.pinWrap} pointerEvents="none">
        <Icon icon={MapPin} size={40} color={theme.colors.map.marker} strokeWidth={2.5} />
      </View>
    </View>
  );
}
