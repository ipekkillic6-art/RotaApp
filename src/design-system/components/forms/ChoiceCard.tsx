import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface ChoiceCardProps {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** `tile` is a square grid cell; `row` is a full-width list row. */
  layout?: 'tile' | 'row';
  /** Right-aligned value on a row — a price, a duration. */
  trailingLabel?: string;
  /** Overrides the accent colour — used by the role picker. */
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: theme.radiusUsage.card,
      borderWidth: theme.borderWidth.thick,
      padding: theme.spacing.md,
    },
    tile: {
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      minHeight: 108,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      minHeight: theme.touchTarget.min + theme.spacing.md,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    labels: { flex: 1, gap: 2 },
    check: {
      width: 20,
      height: 20,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

/**
 * Selectable card — package types, delivery windows, payment methods, roles.
 *
 * Selection is signalled three ways at once: border weight, a tinted icon well
 * and an explicit check mark. On a bright street a courier reads the check
 * long before they read the border colour.
 */
export function ChoiceCard({
  label,
  hint,
  icon,
  selected,
  onPress,
  disabled = false,
  layout = 'row',
  trailingLabel,
  accentColor,
  style,
}: ChoiceCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentColor ?? theme.colors.action.primary;

  const borderColor = selected ? accent : theme.colors.border.default;
  const background = selected
    ? theme.colors.action.secondary
    : theme.colors.background.elevated;

  return (
    <Touchable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      feedback="card"
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      style={[disabled && { opacity: theme.opacity.disabled }, style]}
    >
      <View
        style={[
          styles.base,
          layout === 'tile' ? styles.tile : styles.row,
          { borderColor, backgroundColor: background },
        ]}
      >
        {icon && (
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: selected
                  ? theme.colors.background.elevated
                  : theme.colors.background.secondary,
              },
            ]}
          >
            <Icon
              icon={icon}
              size="md"
              color={selected ? accent : theme.colors.text.secondary}
            />
          </View>
        )}

        <View style={styles.labels}>
          <Typography
            variant="bodyStrong"
            color={selected ? accent : undefined}
            numberOfLines={2}
          >
            {label}
          </Typography>
          {hint && (
            <Typography variant="micro" tone="muted" numberOfLines={2}>
              {hint}
            </Typography>
          )}
        </View>

        {trailingLabel && (
          <Typography variant="bodyStrong" tone="secondary" tabular>
            {trailingLabel}
          </Typography>
        )}

        {layout === 'row' && (
          <View
            style={[
              styles.check,
              {
                backgroundColor: selected ? accent : 'transparent',
                borderWidth: selected ? 0 : theme.borderWidth.thick,
                borderColor: theme.colors.border.strong,
              },
            ]}
          >
            {selected && (
              <Icon icon={Check} size={13} color={theme.colors.text.inverse} strokeWidth={3} />
            )}
          </View>
        )}
      </View>
    </Touchable>
  );
}
