import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: LucideIcon;
  /** Overrides the tone colours — the delivery status badge uses this. */
  colors?: { color: string; surface: string };
  /** Outline instead of a tinted fill, for use on already-tinted surfaces. */
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderRadius: theme.radius.full,
    },
    sm: {
      gap: theme.spacing['2xs'],
      paddingVertical: 3,
      paddingHorizontal: theme.spacing.sm,
    },
    md: {
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    },
  });

/**
 * Compact label. The base for StatusBadge, role chips and count pills.
 *
 * Always renders text — there is no icon-only badge, because a coloured dot
 * with no label is exactly the pattern that makes an ops list unreadable
 * for a colour-blind dispatcher.
 */
export function Badge({
  label,
  tone = 'neutral',
  size = 'sm',
  icon,
  colors,
  outline = false,
  style,
}: BadgeProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const resolved =
    colors ??
    {
      neutral: {
        color: theme.colors.text.secondary,
        surface: theme.colors.background.secondary,
      },
      brand: {
        color: theme.colors.text.accent,
        surface: theme.colors.action.secondary,
      },
      success: {
        color: theme.colors.feedback.success,
        surface: theme.colors.feedback.successSurface,
      },
      warning: {
        color: theme.colors.feedback.warning,
        surface: theme.colors.feedback.warningSurface,
      },
      error: {
        color: theme.colors.feedback.error,
        surface: theme.colors.feedback.errorSurface,
      },
      info: {
        color: theme.colors.feedback.info,
        surface: theme.colors.feedback.infoSurface,
      },
    }[tone];

  return (
    <View
      style={[
        styles.root,
        size === 'sm' ? styles.sm : styles.md,
        outline
          ? {
              backgroundColor: 'transparent',
              borderWidth: theme.borderWidth.hairline,
              borderColor: resolved.color,
            }
          : { backgroundColor: resolved.surface },
        style,
      ]}
    >
      {icon && <Icon icon={icon} size={size === 'sm' ? 12 : 14} color={resolved.color} strokeWidth={2.25} />}
      <Typography
        variant={size === 'sm' ? 'micro' : 'caption'}
        color={resolved.color}
        weight="semibold"
        numberOfLines={1}
      >
        {label}
      </Typography>
    </View>
  );
}
