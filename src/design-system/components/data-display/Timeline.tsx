import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  /** Right-aligned timestamp. */
  timestamp?: string;
  icon?: LucideIcon;
  /** Drives the marker colour; defaults to the theme's muted tone. */
  color?: string;
  /** Dimmed marker and connector — steps not yet reached. */
  upcoming?: boolean;
  /** Emphasised marker with a ring — the step happening now. */
  current?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  style?: StyleProp<ViewStyle>;
}

const MARKER = 28;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.md },
    rail: { width: MARKER, alignItems: 'center' },
    marker: {
      width: MARKER,
      height: MARKER,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    connector: { width: 2, flex: 1, minHeight: theme.spacing.lg },
    body: { flex: 1, paddingBottom: theme.spacing.lg, gap: 2 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
  });

/**
 * Vertical event rail.
 *
 * Generic on purpose — the delivery status timeline is one caller, courier
 * activity and ops audit logs are others. It knows about markers and
 * connectors, not about deliveries.
 */
export function Timeline({ items, style }: TimelineProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={style} accessibilityRole="list">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = item.upcoming
          ? theme.colors.text.muted
          : (item.color ?? theme.colors.action.primary);

        return (
          <View key={item.id} style={styles.row} accessibilityRole="none">
            <View style={styles.rail}>
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: item.upcoming
                      ? theme.colors.background.secondary
                      : color,
                  },
                  item.current && {
                    borderWidth: 3,
                    borderColor: theme.colors.background.brandSubtle,
                  },
                ]}
              >
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    size={14}
                    color={item.upcoming ? theme.colors.text.muted : theme.colors.text.inverse}
                    strokeWidth={2.25}
                  />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: item.upcoming
                        ? theme.colors.border.subtle
                        : theme.colors.border.default,
                    },
                  ]}
                />
              )}
            </View>

            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Typography
                  variant={item.current ? 'bodyStrong' : 'bodySm'}
                  tone={item.upcoming ? 'muted' : 'primary'}
                  numberOfLines={2}
                  style={{ flex: 1 }}
                >
                  {item.title}
                </Typography>
                {item.timestamp && (
                  <Typography variant="micro" tone="muted" tabular>
                    {item.timestamp}
                  </Typography>
                )}
              </View>
              {item.description && (
                <Typography variant="micro" tone={item.upcoming ? 'muted' : 'secondary'}>
                  {item.description}
                </Typography>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
