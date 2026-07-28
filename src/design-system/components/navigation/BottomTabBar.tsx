import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';

export interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Dot or count on the tab. */
  badge?: number | boolean;
}

export interface BottomTabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Tints the active tab with the role's accent instead of the brand colour. */
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: theme.colors.background.elevated,
      borderTopWidth: theme.borderWidth.hairline,
      borderTopColor: theme.colors.border.subtle,
      paddingBottom: theme.chrome.homeIndicator,
      zIndex: theme.zIndex.tabBar,
    },
    tab: {
      flex: 1,
      minHeight: theme.chrome.tabBar,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingTop: theme.spacing.sm,
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: '28%',
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.feedback.error,
    },
    dot: {
      position: 'absolute',
      top: 6,
      right: '32%',
      width: 8,
      height: 8,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.feedback.error,
    },
  });

/**
 * Bottom navigation.
 *
 * Docked rather than floating: a floating pill looks good in a screenshot but
 * costs a courier the bottom 100pt of a list on every screen, and this app is
 * mostly lists. Active state is icon fill + label colour + weight — three
 * signals, so it survives a low-contrast screen in sunlight.
 */
export function BottomTabBar({
  tabs,
  activeKey,
  onChange,
  accentColor,
  style,
}: BottomTabBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentColor ?? theme.colors.action.primary;

  return (
    <View style={[styles.root, style]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Touchable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            feedback="opacity"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={{ flex: 1 }}
          >
            <View style={styles.tab}>
              <Icon
                icon={tab.icon}
                size="lg"
                color={active ? accent : theme.colors.text.muted}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <Typography
                variant="tiny"
                color={active ? accent : theme.colors.text.muted}
                weight={active ? 'semibold' : 'medium'}
                numberOfLines={1}
              >
                {tab.label}
              </Typography>

              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Typography variant="tiny" color={theme.colors.text.onSolid} weight="bold">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </Typography>
                </View>
              )}
              {tab.badge === true && <View style={styles.dot} />}
            </View>
          </Touchable>
        );
      })}
    </View>
  );
}
