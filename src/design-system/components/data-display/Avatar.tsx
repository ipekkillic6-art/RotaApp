import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';
import { initials as toInitials } from '../../../utils/format';
import type { AvatarSizeToken } from '../../tokens';

export type AvatarStatus = 'available' | 'busy' | 'offline' | 'suspended';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSizeToken;
  /** Presence dot in the bottom-right corner. */
  status?: AvatarStatus;
  style?: StyleProp<ViewStyle>;
}

const FONT_FOR: Record<AvatarSizeToken, 'micro' | 'caption' | 'bodyStrong' | 'h3' | 'h2'> = {
  xs: 'micro',
  sm: 'caption',
  md: 'bodyStrong',
  lg: 'h3',
  xl: 'h2',
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { alignItems: 'center', justifyContent: 'center' },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.secondary,
    },
    dot: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      borderRadius: theme.radius.full,
      borderWidth: theme.borderWidth.thick,
      borderColor: theme.colors.background.elevated,
    },
  });

/**
 * Avatar with an initials fallback.
 *
 * The fallback is not a decoration — a meaningful share of couriers have no
 * photo, and a grey silhouette makes a courier list unscannable. Initials
 * keep each row identifiable.
 */
export function Avatar({ name, imageUrl, size = 'md', status, style }: AvatarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [failed, setFailed] = useState(false);

  const px = theme.avatarSize[size];
  const showImage = !!imageUrl && !failed;
  const dot = Math.max(8, Math.round(px * 0.28));

  const statusColor = status
    ? {
        available: theme.colors.feedback.success,
        busy: theme.colors.feedback.warning,
        offline: theme.colors.text.muted,
        suspended: theme.colors.feedback.error,
      }[status]
    : undefined;

  const statusLabel = status
    ? {
        available: 'Müsait',
        busy: 'Meşgul',
        offline: 'Çevrimdışı',
        suspended: 'Askıya alınmış',
      }[status]
    : undefined;

  return (
    <View
      style={[styles.root, { width: px, height: px }, style]}
      accessibilityLabel={statusLabel ? `${name}, ${statusLabel}` : name}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          onError={() => setFailed(true)}
          style={{ width: px, height: px, borderRadius: theme.radius.full }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: px, height: px, borderRadius: theme.radius.full },
          ]}
        >
          <Typography variant={FONT_FOR[size]} tone="secondary">
            {toInitials(name)}
          </Typography>
        </View>
      )}

      {statusColor && (
        <View
          style={[
            styles.dot,
            { width: dot, height: dot, backgroundColor: statusColor },
          ]}
        />
      )}
    </View>
  );
}
