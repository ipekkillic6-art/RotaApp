import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Divider } from '../../foundations/Layout';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { BottomSheet } from './BottomSheet';

export interface SheetAction {
  key: string;
  label: string;
  /** Secondary line — explains a consequence. */
  description?: string;
  icon?: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: SheetAction[];
  title?: string;
  description?: string;
  cancelLabel?: string;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      minHeight: 56,
      paddingVertical: theme.spacing.sm,
    },
    labels: { flex: 1, gap: 2 },
  });

/**
 * List of choices in a sheet.
 *
 * Used instead of a native alert for every confirmation with more than two
 * outcomes — "teslim edilemedi" reasons, delivery actions, sort options.
 */
export function ActionSheet({
  visible,
  onClose,
  actions,
  title,
  description,
  cancelLabel = 'Vazgeç',
}: ActionSheetProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} description={description}>
      <View>
        {actions.map((action, index) => (
          <React.Fragment key={action.key}>
            {index > 0 && <Divider />}
            <Touchable
              onPress={
                action.disabled
                  ? undefined
                  : () => {
                      action.onPress();
                      onClose();
                    }
              }
              disabled={action.disabled}
              feedback="opacity"
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={action.description}
              style={action.disabled ? { opacity: theme.opacity.disabled } : undefined}
            >
              <View style={styles.row}>
                {action.icon && (
                  <Icon
                    icon={action.icon}
                    size="md"
                    color={
                      action.destructive
                        ? theme.colors.feedback.error
                        : theme.colors.text.secondary
                    }
                  />
                )}
                <View style={styles.labels}>
                  <Typography
                    variant="body"
                    tone={action.destructive ? 'danger' : 'primary'}
                  >
                    {action.label}
                  </Typography>
                  {action.description && (
                    <Typography variant="micro" tone="muted">
                      {action.description}
                    </Typography>
                  )}
                </View>
              </View>
            </Touchable>
          </React.Fragment>
        ))}

        <Divider style={{ marginTop: theme.spacing.sm }} />
        <Touchable
          onPress={onClose}
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        >
          <View style={[styles.row, { justifyContent: 'center' }]}>
            <Typography variant="bodyStrong" tone="secondary">
              {cancelLabel}
            </Typography>
          </View>
        </Touchable>
      </View>
    </BottomSheet>
  );
}
