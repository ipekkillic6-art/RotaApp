import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface FloatingActionButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  /** Extended FAB — the label sits beside the icon. */
  label?: string;
  /** Docks the button above the tab bar. Off when the parent positions it. */
  docked?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    docked: {
      position: 'absolute',
      right: theme.layout.screenPaddingX,
      bottom: theme.chrome.tabBar + theme.spacing.lg,
      zIndex: theme.zIndex.floating,
    },
    body: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.controlHeight.lg,
      minWidth: theme.controlHeight.lg,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.action.primary,
      gap: theme.spacing.sm,
    },
  });

/**
 * The single most important action on a screen, reachable with one thumb.
 * Kept at 56pt so it clears the touch-target floor even with gloves on a bike.
 */
export function FloatingActionButton({
  icon,
  accessibilityLabel,
  onPress,
  label,
  docked = true,
  disabled = false,
  style,
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <Touchable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[docked && styles.docked, { opacity: disabled ? theme.opacity.disabled : 1 }, style]}
    >
      <View
        style={[
          styles.body,
          theme.shadows.brand,
          label ? { paddingHorizontal: theme.spacing.xl } : null,
        ]}
      >
        <Icon icon={icon} size="lg" color={theme.colors.text.inverse} />
        {label && (
          <Typography variant="bodyStrong" color={theme.colors.text.inverse}>
            {label}
          </Typography>
        )}
      </View>
    </Touchable>
  );
}
