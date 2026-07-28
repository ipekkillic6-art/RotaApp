import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface InlineAlertProps {
  /** Body copy. Required — an alert with only a title says nothing. */
  message: string;
  title?: string;
  tone?: AlertTone;
  /** `banner` is full-bleed at the top of a screen; `inline` sits in content. */
  variant?: 'inline' | 'banner';
  icon?: LucideIcon;
  onDismiss?: () => void;
  /** A single inline action, e.g. "Tekrar dene". */
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}

const TONE_ICON: Record<AlertTone, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    inline: { borderRadius: theme.radius.md },
    banner: { borderRadius: 0, paddingHorizontal: theme.layout.screenPaddingX },
    body: { flex: 1, gap: 2 },
    actionRow: { marginTop: theme.spacing.xs },
  });

/**
 * Contextual message attached to content — not a transient toast.
 *
 * Tone is carried by an icon and a label as well as colour, so the difference
 * between "warning" and "error" survives a colour-blind user and a dimmed
 * screen in daylight.
 */
export function InlineAlert({
  message,
  title,
  tone = 'info',
  variant = 'inline',
  icon,
  onDismiss,
  action,
  style,
}: InlineAlertProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const color = theme.colors.feedback[tone];
  const surface = theme.colors.feedback[`${tone}Surface` as const];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      style={[
        styles.root,
        variant === 'banner' ? styles.banner : styles.inline,
        { backgroundColor: surface },
        style,
      ]}
    >
      <Icon icon={icon ?? TONE_ICON[tone]} size="md" color={color} />

      <View style={styles.body}>
        {title && (
          <Typography variant="bodyStrong" color={color}>
            {title}
          </Typography>
        )}
        <Typography variant="bodySm" tone="secondary">
          {message}
        </Typography>

        {action && (
          <Touchable
            onPress={action.onPress}
            feedback="opacity"
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={styles.actionRow}
          >
            <Typography variant="caption" color={color} weight="semibold">
              {action.label}
            </Typography>
          </Touchable>
        )}
      </View>

      {onDismiss && (
        <Touchable
          onPress={onDismiss}
          feedback="opacity"
          accessibilityLabel="Kapat"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon icon={X} size="sm" tone="muted" />
        </Touchable>
      )}
    </View>
  );
}
