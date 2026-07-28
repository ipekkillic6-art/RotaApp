import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';
import { Button } from '../buttons/Button';

export type StateTone = 'neutral' | 'brand' | 'warning' | 'error';

export interface StateViewProps {
  icon: LucideIcon;
  title: string;
  /** One or two sentences. Say what happened AND what to do next. */
  description?: string;
  tone?: StateTone;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  /** Fills the parent and centres. Off when embedded in a scrolling list. */
  fullHeight?: boolean;
  /** `compact` shrinks the icon well for use inside a card. */
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing['3xl'],
    },
    iconWell: { alignItems: 'center', justifyContent: 'center' },
    text: { gap: theme.spacing.xs, alignItems: 'center' },
    actions: { gap: theme.spacing.sm, alignSelf: 'stretch', marginTop: theme.spacing.sm },
  });

/**
 * The one component behind every empty, error and permission state.
 *
 * Having a single implementation is what makes forty edge cases feel designed
 * rather than improvised — the presets in `presets.ts` are just arguments to
 * this. Illustrations are icon-based on purpose: bespoke artwork per state is
 * unmaintainable at this count and would be the first thing to rot.
 */
export function StateView({
  icon,
  title,
  description,
  tone = 'neutral',
  primaryAction,
  secondaryAction,
  fullHeight = false,
  size = 'default',
  style,
}: StateViewProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const color = {
    neutral: theme.colors.text.muted,
    brand: theme.colors.text.accent,
    warning: theme.colors.feedback.warning,
    error: theme.colors.feedback.error,
  }[tone];

  const surface = {
    neutral: theme.colors.background.secondary,
    brand: theme.colors.action.secondary,
    warning: theme.colors.feedback.warningSurface,
    error: theme.colors.feedback.errorSurface,
  }[tone];

  const well = size === 'compact' ? 56 : 80;

  return (
    <View
      style={[styles.root, fullHeight && { flex: 1 }, style]}
      accessibilityRole="summary"
      accessibilityLabel={description ? `${title}. ${description}` : title}
    >
      <View
        style={[
          styles.iconWell,
          {
            width: well,
            height: well,
            borderRadius: theme.radius.full,
            backgroundColor: surface,
          },
        ]}
      >
        <Icon icon={icon} size={size === 'compact' ? 'xl' : 'hero'} color={color} strokeWidth={1.5} />
      </View>

      <View style={styles.text}>
        <Typography variant={size === 'compact' ? 'h3' : 'h2'} align="center">
          {title}
        </Typography>
        {description && (
          <Typography
            variant="bodySm"
            tone="secondary"
            align="center"
            style={{ maxWidth: 300 }}
          >
            {description}
          </Typography>
        )}
      </View>

      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {primaryAction && (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              variant={tone === 'error' ? 'primary' : 'primary'}
            />
          )}
          {secondaryAction && (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="tertiary"
            />
          )}
        </View>
      )}
    </View>
  );
}
