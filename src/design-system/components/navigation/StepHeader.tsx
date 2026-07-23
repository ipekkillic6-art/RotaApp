import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';
import { IconButton } from '../buttons/IconButton';
import { StepProgress } from '../feedback/Progress';

export interface StepHeaderProps {
  /** 1-based. */
  current: number;
  total: number;
  title: string;
  /** One line describing what this step needs. */
  description?: string;
  onBack?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      paddingHorizontal: theme.layout.screenPaddingX,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: theme.chrome.header,
      marginHorizontal: -theme.spacing.sm,
    },
    titles: { gap: 2 },
  });

/**
 * Header for the multi-step delivery form.
 *
 * Progress sits above the title so the "where am I / how much is left"
 * question is answered before the content is read — the single biggest
 * predictor of whether a multi-step form gets finished.
 */
export function StepHeader({
  current,
  total,
  title,
  description,
  onBack,
  onClose,
  style,
}: StepHeaderProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.bar}>
        {onBack ? (
          <IconButton icon={ChevronLeft} accessibilityLabel="Geri" onPress={onBack} size="lg" />
        ) : (
          <View style={{ width: 48 }} />
        )}
        <Typography variant="micro" tone="muted" tabular>
          Adım {current}/{total}
        </Typography>
        {onClose ? (
          <IconButton icon={X} accessibilityLabel="Kapat" onPress={onClose} size="lg" />
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <StepProgress current={current} total={total} />

      <View style={styles.titles}>
        <Typography variant="h2">{title}</Typography>
        {description && (
          <Typography variant="bodySm" tone="secondary">
            {description}
          </Typography>
        )}
      </View>
    </View>
  );
}
