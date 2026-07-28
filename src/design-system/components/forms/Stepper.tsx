import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { FieldShell } from './FieldShell';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  /** Unit suffix rendered after the value ("kg", "adet"). */
  unit?: string;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xs,
      borderRadius: theme.radiusUsage.input,
      borderWidth: theme.borderWidth.hairline,
      borderColor: theme.colors.border.default,
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.xs,
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.secondary,
    },
    value: { minWidth: 56, alignItems: 'center' },
  });

/** Numeric stepper for counts and weights — large targets, tabular figures. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  helperText,
  errorText,
  disabled,
  unit,
}: StepperProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const canDecrease = !disabled && value - step >= min;
  const canIncrease = !disabled && value + step <= max;

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
    >
      <View
        style={styles.row}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value }}
      >
        <Touchable
          onPress={canDecrease ? () => onChange(value - step) : undefined}
          disabled={!canDecrease}
          accessibilityLabel="Azalt"
          feedback="control"
          style={{ opacity: canDecrease ? 1 : theme.opacity.disabled }}
        >
          <View style={styles.button}>
            <Icon icon={Minus} size="md" tone="primary" />
          </View>
        </Touchable>

        <View style={styles.value}>
          <Typography variant="h3" tabular>
            {value}
            {unit ? ` ${unit}` : ''}
          </Typography>
        </View>

        <Touchable
          onPress={canIncrease ? () => onChange(value + step) : undefined}
          disabled={!canIncrease}
          accessibilityLabel="Artır"
          feedback="control"
          style={{ opacity: canIncrease ? 1 : theme.opacity.disabled }}
        >
          <View style={styles.button}>
            <Icon icon={Plus} size="md" tone="primary" />
          </View>
        </Touchable>
      </View>
    </FieldShell>
  );
}
