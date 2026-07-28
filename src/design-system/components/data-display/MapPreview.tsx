import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { Maximize2, Navigation } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
// Koordinat tipi tek kaynaktan — MapPicker ile aynı şekil.
import type { LatLng } from './MapPicker';

export interface MapPreviewProps {
  height?: number;
  /** Overlaid summary, e.g. "Tahmini varış 14 dk · 3,2 km". */
  caption?: string;
  /** Alış noktası. Verilmezse demo koordinatı kullanılır (Storybook). */
  pickup?: LatLng;
  /** Teslimat noktası. Tek nokta verilirse rota çizilmez. */
  dropoff?: LatLng;
  /** Kurye konumu — verildiğinde kurye işareti çizilir. */
  courier?: LatLng;
  /** Kurye işaretini göster. `courier` koordinatı yoksa etkisizdir. */
  showCourier?: boolean;
  onPress?: () => void;
  /** Replaces the map with a permission prompt. */
  permissionDenied?: boolean;
  onRequestPermission?: () => void;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Demo koordinatları (İstanbul) — yalnızca prop verilmediğinde. */
const DEMO_PICKUP: LatLng = { latitude: 41.0602, longitude: 28.9877 }; // Şişli
const DEMO_DROPOFF: LatLng = { latitude: 40.9903, longitude: 29.027 }; // Kadıköy
const DEMO_COURIER: LatLng = { latitude: 41.025, longitude: 29.007 };

/** Verilen noktaların hepsini içine alan bölge; tek nokta için sabit yakınlık. */
function regionFor(points: LatLng[]): Region {
  if (points.length === 0) {
    return { ...DEMO_PICKUP, latitudeDelta: 0.11, longitudeDelta: 0.11 };
  }
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // %40 pay bırak ki işaretler kenara yapışmasın; tek noktada taban yakınlık.
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.012),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.012),
  };
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { overflow: 'hidden', justifyContent: 'flex-end' },
    pin: {
      width: 16,
      height: 16,
      borderRadius: theme.radius.full,
      borderWidth: 3,
      borderColor: theme.colors.background.elevated,
    },
    courier: {
      width: 30,
      height: 30,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.action.primary,
    },
    caption: {
      margin: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background.overlay,
      alignSelf: 'flex-start',
    },
    expand: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.overlay,
    },
    permission: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
    },
  });

/**
 * Harita önizlemesi.
 *
 * iOS'ta Apple Maps (anahtar gerektirmez), Android'de Google Maps. Prop
 * arayüzü tasarım aşamasındaki placeholder ile AYNI — bu yüzden haritayı
 * kullanan ekranların hiçbiri değişmedi. Önizleme olduğu için kaydırma/zoom
 * kapalı; `onPress` tam ekran haritayı açar.
 */
export function MapPreview({
  height = 180,
  caption,
  pickup,
  dropoff,
  courier,
  showCourier = false,
  onPress,
  permissionDenied = false,
  onRequestPermission,
  radius,
  style,
}: MapPreviewProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const interactive = !onPress; // onPress varsa dokunuşu Touchable alsın.

  // Hiç koordinat verilmediyse demo rotası (Storybook); biri verildiyse
  // yalnızca verilenler çizilir — uydurma nokta eklenmez.
  const anyGiven = pickup != null || dropoff != null || courier != null;
  const from = anyGiven ? pickup : DEMO_PICKUP;
  const to = anyGiven ? dropoff : DEMO_DROPOFF;
  const courierAt = anyGiven ? courier : showCourier ? DEMO_COURIER : undefined;
  const showCourierMarker = courierAt != null && (anyGiven || showCourier);

  const route = [from, courierAt, to].filter((p): p is LatLng => p != null);
  const region = regionFor(route);
  // Rota yalnızca iki uç da bilindiğinde anlamlı.
  const routeLine = from && to ? (showCourierMarker && courierAt ? [from, courierAt, to] : [from, to]) : [];

  const body = (
    <View
      style={[
        styles.root,
        {
          height,
          borderRadius: radius ?? theme.radiusUsage.card,
          backgroundColor: theme.colors.map.canvas,
        },
        style,
      ]}
      accessibilityLabel={caption ? `Harita önizlemesi. ${caption}` : 'Harita önizlemesi'}
    >
      {permissionDenied ? (
        <View style={styles.permission}>
          <Typography variant="bodyStrong" align="center">
            Konum izni verilmedi
          </Typography>
          <Typography variant="micro" tone="secondary" align="center">
            Canlı takip için konum iznine ihtiyacımız var.
          </Typography>
          {onRequestPermission && (
            <Touchable
              onPress={onRequestPermission}
              feedback="opacity"
              accessibilityLabel="Konum izni ver"
            >
              <Typography variant="caption" tone="accent" weight="semibold">
                İzin ver
              </Typography>
            </Touchable>
          )}
        </View>
      ) : (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents={interactive ? 'auto' : 'none'}>
            <MapView
              style={StyleSheet.absoluteFill}
              region={region}
              scrollEnabled={interactive}
              zoomEnabled={interactive}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
            >
              {routeLine.length >= 2 && (
                <Polyline
                  coordinates={routeLine}
                  strokeColor={theme.colors.map.route}
                  strokeWidth={4}
                />
              )}
              {from && (
                <Marker coordinate={from} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={[styles.pin, { backgroundColor: theme.colors.map.marker }]} />
                </Marker>
              )}
              {to && (
                <Marker coordinate={to} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={[styles.pin, { backgroundColor: theme.colors.feedback.success }]} />
                </Marker>
              )}
              {showCourierMarker && courierAt && (
                <Marker coordinate={courierAt} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={styles.courier}>
                    <Icon icon={Navigation} size={16} color={theme.colors.text.inverse} strokeWidth={2.5} />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>

          {onPress && (
            <View style={styles.expand}>
              <Icon icon={Maximize2} size="sm" tone="secondary" />
            </View>
          )}

          {caption && (
            <View style={styles.caption}>
              <Typography variant="micro" weight="semibold" tabular>
                {caption}
              </Typography>
            </View>
          )}
        </>
      )}
    </View>
  );

  if (!onPress || permissionDenied) return body;

  return (
    <Touchable onPress={onPress} feedback="card" accessibilityLabel="Haritayı aç">
      {body}
    </Touchable>
  );
}
