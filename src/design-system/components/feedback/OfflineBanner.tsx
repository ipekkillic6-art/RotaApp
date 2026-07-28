import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CloudOff, RefreshCw } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface OfflineBannerProps {
  visible?: boolean;
  /** Overrides the default copy — e.g. "Sunucuya ulaşılamıyor". */
  message?: string;
  onRetry?: () => void;
  /** Number of actions queued locally, shown when the courier is offline. */
  queuedCount?: number;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.layout.screenPaddingX,
      backgroundColor: theme.colors.feedback.warningSurface,
      zIndex: theme.zIndex.banner,
    },
    body: { flex: 1 },
  });

/**
 * Connectivity banner.
 *
 * Docked under the header rather than floating: a courier who loses signal
 * mid-ride needs a persistent statement of fact, not a toast that vanishes
 * before they look up from the road. The queued-action count is the part that
 * actually reassures — it says the work was not lost.
 */
export function OfflineBanner({
  visible = true,
  message = 'İnternet bağlantısı yok',
  onRetry,
  queuedCount,
}: OfflineBannerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (!visible) return null;

  return (
    <View style={styles.root} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon icon={CloudOff} size="sm" color={theme.colors.feedback.warning} />
      <View style={styles.body}>
        <Typography variant="micro" color={theme.colors.feedback.warning} weight="semibold">
          {message}
        </Typography>
        {queuedCount !== undefined && queuedCount > 0 && (
          <Typography variant="micro" tone="muted">
            {queuedCount} işlem bağlantı gelince gönderilecek
          </Typography>
        )}
      </View>
      {onRetry && (
        <Touchable
          onPress={onRetry}
          feedback="opacity"
          accessibilityLabel="Yeniden dene"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon icon={RefreshCw} size="sm" color={theme.colors.feedback.warning} />
        </Touchable>
      )}
    </View>
  );
}
