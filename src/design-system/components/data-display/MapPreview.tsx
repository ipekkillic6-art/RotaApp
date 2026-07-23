import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Maximize2, Navigation } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface MapPreviewProps {
  height?: number;
  /** Overlaid summary, e.g. "Tahmini varış 14 dk · 3,2 km". */
  caption?: string;
  /** Shows a courier marker travelling along the route. */
  showCourier?: boolean;
  onPress?: () => void;
  /** Replaces the map with a permission prompt. */
  permissionDenied?: boolean;
  onRequestPermission?: () => void;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

// Demo koordinatları (İstanbul). Gerçek teslimatta prop'la geçilecek.
const PICKUP = { latitude: 41.0602, longitude: 28.9877 }; // Şişli
const DROPOFF = { latitude: 40.9903, longitude: 29.027 }; // Kadıköy
const COURIER = { latitude: 41.025, longitude: 29.007 };
const REGION = {
  latitude: (PICKUP.latitude + DROPOFF.latitude) / 2,
  longitude: (PICKUP.longitude + DROPOFF.longitude) / 2,
  latitudeDelta: 0.11,
  longitudeDelta: 0.11,
};

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
              initialRegion={REGION}
              scrollEnabled={interactive}
              zoomEnabled={interactive}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
            >
              <Polyline
                coordinates={showCourier ? [PICKUP, COURIER, DROPOFF] : [PICKUP, DROPOFF]}
                strokeColor={theme.colors.map.route}
                strokeWidth={4}
              />
              <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.pin, { backgroundColor: theme.colors.map.marker }]} />
              </Marker>
              <Marker coordinate={DROPOFF} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.pin, { backgroundColor: theme.colors.feedback.success }]} />
              </Marker>
              {showCourier && (
                <Marker coordinate={COURIER} anchor={{ x: 0.5, y: 0.5 }}>
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
