import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { IconButton } from '../buttons/IconButton';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  /** One line under the title. */
  description?: string;
  /** Pinned action row at the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  /** Fraction of the screen height the sheet may occupy. */
  maxHeightRatio?: number;
  /** Hides the grab handle — for sheets that must be dismissed by a button. */
  dismissible?: boolean;
  showCloseButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', zIndex: theme.zIndex.sheet },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: theme.colors.background.scrim },
    sheet: {
      backgroundColor: theme.colors.background.overlay,
      borderTopLeftRadius: theme.radiusUsage.sheet,
      borderTopRightRadius: theme.radiusUsage.sheet,
      paddingBottom: theme.chrome.homeIndicator,
      overflow: 'hidden',
      alignSelf: 'center',
      width: '100%',
      // On a tablet the sheet stops being full-bleed and becomes a panel.
      maxWidth: theme.layout.maxContentWidth,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.border.strong,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.layout.screenPaddingX,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    headerText: { flex: 1, gap: 2 },
    body: { paddingHorizontal: theme.layout.screenPaddingX },
    footer: {
      paddingHorizontal: theme.layout.screenPaddingX,
      paddingTop: theme.spacing.md,
      borderTopWidth: theme.borderWidth.hairline,
      borderTopColor: theme.colors.border.subtle,
      gap: theme.spacing.sm,
    },
  });

/**
 * Bottom sheet — the app's default overlay.
 *
 * Sheets are preferred over centred modals for anything a thumb must reach:
 * they start at the bottom of the screen, which is where the hand already is.
 * Centred `Modal` is reserved for blocking confirmations.
 *
 * The entrance slides and fades; under reduced motion it fades only.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  description,
  footer,
  maxHeightRatio = 0.9,
  dismissible = true,
  showCloseButton = false,
  style,
}: BottomSheetProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? theme.duration.deliberate : theme.duration.normal,
      easing: visible ? theme.easing.enter : theme.easing.exit,
      useNativeDriver: true,
    }).start();
  }, [visible, progress, theme]);

  if (!visible) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.35, 0],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.scrim, { opacity: progress }]}>
        <Touchable
          onPress={dismissible ? onClose : undefined}
          disabled={!dismissible}
          feedback="none"
          accessibilityLabel="Kapat"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
        >
          <View style={StyleSheet.absoluteFill} />
        </Touchable>
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          theme.shadows.lg,
          {
            maxHeight: height * maxHeightRatio,
            opacity: progress,
            transform: theme.reducedMotion ? [] : [{ translateY }],
          },
          style,
        ]}
      >
        {dismissible && <View style={styles.handle} />}

        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title && <Typography variant="h3">{title}</Typography>}
              {description && (
                <Typography variant="bodySm" tone="secondary">
                  {description}
                </Typography>
              )}
            </View>
            {showCloseButton && (
              <IconButton icon={X} accessibilityLabel="Kapat" onPress={onClose} />
            )}
          </View>
        )}

        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: theme.spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer && <View style={styles.footer}>{footer}</View>}
      </Animated.View>
    </View>
  );
}
