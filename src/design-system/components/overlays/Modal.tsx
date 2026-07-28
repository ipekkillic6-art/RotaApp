import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { Button } from '../buttons/Button';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  /** Tapping the scrim closes it. Off for decisions that must be answered. */
  dismissOnScrim?: boolean;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      zIndex: theme.zIndex.sheet,
    },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.background.scrim },
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: theme.radiusUsage.modal,
      backgroundColor: theme.colors.background.overlay,
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    iconWell: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    actions: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  });

/** Centred modal. Reserved for blocking decisions — everything else is a sheet. */
export function Modal({
  visible,
  onClose,
  children,
  title,
  dismissOnScrim = true,
  style,
}: ModalProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: theme.duration.normal,
      easing: visible ? theme.easing.enter : theme.easing.exit,
      useNativeDriver: true,
    }).start();
  }, [visible, progress, theme]);

  if (!visible) return null;

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.scrim, { opacity: progress }]}>
        <Touchable
          onPress={dismissOnScrim ? onClose : undefined}
          disabled={!dismissOnScrim}
          feedback="none"
          accessibilityLabel="Kapat"
          style={StyleSheet.absoluteFill}
        >
          <View style={StyleSheet.absoluteFill} />
        </Touchable>
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.card,
          theme.shadows.lg,
          { opacity: progress, transform: theme.reducedMotion ? [] : [{ scale }] },
          style,
        ]}
      >
        {title && (
          <Typography variant="h3" align="center">
            {title}
          </Typography>
        )}
        {children}
      </Animated.View>
    </View>
  );
}

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  /** Primary action. `destructive` recolours it and requires deliberate intent. */
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel: () => void;
  destructive?: boolean;
  icon?: LucideIcon;
  loading?: boolean;
}

/**
 * Blocking yes/no.
 *
 * The destructive action is a full-width `danger` button and the cancel is
 * `tertiary` — cancel is never the visually louder option, but it is always
 * the easier target to hit by accident-avoidance (it sits below the thumb's
 * resting arc).
 */
export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Vazgeç',
  onCancel,
  destructive = false,
  icon,
  loading = false,
}: ConfirmationDialogProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} onClose={onCancel} dismissOnScrim={!loading}>
      {icon && (
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: destructive
                ? theme.colors.feedback.errorSurface
                : theme.colors.action.secondary,
            },
          ]}
        >
          <Icon
            icon={icon}
            size="lg"
            color={destructive ? theme.colors.feedback.error : theme.colors.text.accent}
          />
        </View>
      )}

      <Typography variant="h3" align="center">
        {title}
      </Typography>
      <Typography variant="bodySm" tone="secondary" align="center">
        {message}
      </Typography>

      <View style={styles.actions}>
        <Button
          label={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          onPress={onConfirm}
          loading={loading}
        />
        <Button label={cancelLabel} variant="tertiary" onPress={onCancel} disabled={loading} />
      </View>
    </Modal>
  );
}
