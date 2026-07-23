import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Typography } from '../../foundations/Typography';
import { IconButton } from '../buttons/IconButton';

export interface HeaderAction {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: number | boolean;
}

export interface AppHeaderProps {
  title?: string;
  /** Second line under the title — a tracking number, a date range. */
  subtitle?: string;
  /** Shows a back chevron on the left. */
  onBack?: () => void;
  /** Up to two trailing actions; more than two belongs in an action sheet. */
  actions?: HeaderAction[];
  /** Replaces the title row entirely — used by the search header. */
  center?: React.ReactNode;
  /** Left slot when there is no back button — an avatar, a role switcher. */
  leading?: React.ReactNode;
  /** `large` renders a big title below the bar, iOS-style. */
  variant?: 'default' | 'large';
  /** Hairline under the header. Off when the content below is a hero. */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { backgroundColor: theme.colors.background.primary, zIndex: theme.zIndex.header },
    bar: {
      minHeight: theme.chrome.header,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    center: { flex: 1, justifyContent: 'center' },
    centeredTitle: { alignItems: 'center' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing['2xs'] },
    largeTitle: {
      paddingHorizontal: theme.layout.screenPaddingX,
      paddingBottom: theme.spacing.md,
      gap: 2,
    },
  });

/**
 * Screen header.
 *
 * One component covers the back / title / search / large-title variants,
 * because they differ only in which slot is filled. Splitting them into four
 * components is how header heights start disagreeing between screens.
 */
export function AppHeader({
  title,
  subtitle,
  onBack,
  actions = [],
  center,
  leading,
  variant = 'default',
  bordered = false,
  style,
}: AppHeaderProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const showInlineTitle = variant === 'default' && !center;
  // A centred title needs symmetric edges; with a back button and no actions
  // we reserve the same width on the right so the title stays optically centred.
  const centreTitle = showInlineTitle && !!onBack && actions.length === 0 && !leading;

  return (
    <View
      style={[
        styles.root,
        bordered && {
          borderBottomWidth: theme.borderWidth.hairline,
          borderBottomColor: theme.colors.border.subtle,
        },
        style,
      ]}
    >
      <View style={styles.bar}>
        {onBack && (
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Geri"
            onPress={onBack}
            size="lg"
          />
        )}
        {leading}

        <View style={[styles.center, centreTitle && styles.centeredTitle]}>
          {center}
          {showInlineTitle && title && (
            <>
              <Typography variant="h3" numberOfLines={1}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="micro" tone="muted" numberOfLines={1}>
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </View>

        <View style={styles.actions}>
          {actions.slice(0, 2).map((action) => (
            <IconButton
              key={action.accessibilityLabel}
              icon={action.icon}
              accessibilityLabel={action.accessibilityLabel}
              onPress={action.onPress}
              badge={action.badge}
              size="lg"
            />
          ))}
          {centreTitle && <View style={{ width: 48 }} />}
        </View>
      </View>

      {variant === 'large' && title && (
        <View style={styles.largeTitle}>
          <Typography variant="h1" numberOfLines={2}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="bodySm" tone="secondary">
              {subtitle}
            </Typography>
          )}
        </View>
      )}
    </View>
  );
}
