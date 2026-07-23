import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { overflow: 'hidden', justifyContent: 'flex-end' },
    road: { position: 'absolute', backgroundColor: theme.colors.map.road },
    route: {
      position: 'absolute',
      height: 4,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.map.route,
    },
    pin: {
      position: 'absolute',
      width: 14,
      height: 14,
      borderRadius: theme.radius.full,
      borderWidth: 3,
      borderColor: theme.colors.background.elevated,
    },
    courier: {
      position: 'absolute',
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
 * Map placeholder.
 *
 * No map SDK is added at this stage — that is a real dependency with keys,
 * billing and native config, and it would block the design work. This draws a
 * schematic route so every screen that will host a map is laid out, measured
 * and reviewable now; swapping in MapView later changes this file only.
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
          {/* Schematic street grid. */}
          <View style={[styles.road, { left: 0, right: 0, top: height * 0.32, height: 8 }]} />
          <View style={[styles.road, { left: 0, right: 0, top: height * 0.72, height: 6 }]} />
          <View style={[styles.road, { top: 0, bottom: 0, left: '26%', width: 7 }]} />
          <View style={[styles.road, { top: 0, bottom: 0, left: '68%', width: 5 }]} />

          {/* Route. */}
          <View style={[styles.route, { left: '18%', width: '52%', top: height * 0.35 }]} />
          <View
            style={[
              styles.route,
              { left: '66%', width: 4, top: height * 0.35, height: height * 0.38 },
            ]}
          />

          <View
            style={[
              styles.pin,
              { left: '16%', top: height * 0.32, backgroundColor: theme.colors.map.marker },
            ]}
          />
          <View
            style={[
              styles.pin,
              {
                left: '66%',
                top: height * 0.71,
                backgroundColor: theme.colors.feedback.success,
              },
            ]}
          />

          {showCourier && (
            <View style={[styles.courier, { left: '44%', top: height * 0.29 }]}>
              <Icon icon={Navigation} size={16} color={theme.colors.text.inverse} strokeWidth={2.5} />
            </View>
          )}

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
