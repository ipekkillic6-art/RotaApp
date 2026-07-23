import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Touchable } from '../../foundations/Touchable';
import { Typography } from '../../foundations/Typography';
import { FieldShell, useFieldBorder } from './FieldShell';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface TriggerProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minHeight: theme.controlHeight.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radiusUsage.input,
      borderWidth: theme.borderWidth.hairline,
    },
    value: { flex: 1 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      minHeight: theme.touchTarget.min,
    },
    optionLabels: { flex: 1, gap: 2 },
  });

/**
 * Field-shaped trigger.
 *
 * Select, MultiSelect, DatePickerTrigger and TimePickerTrigger all render the
 * same control and differ only in what they display and which overlay they
 * open — so the trigger itself is shared. The overlay is the caller's job,
 * which keeps these components free of navigation knowledge.
 */
export function FieldTrigger({
  label,
  helperText,
  errorText,
  required,
  disabled,
  placeholder,
  icon,
  onPress,
  style,
  displayValue,
  trailingIcon = ChevronDown,
}: TriggerProps & { displayValue?: string; trailingIcon?: LucideIcon }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const borderColor = useFieldBorder({ status: errorText ? 'error' : 'default', disabled });
  const hasValue = !!displayValue;

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      errorText={errorText}
      required={required}
      disabled={disabled}
      style={style}
    >
      <Touchable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        feedback="opacity"
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityValue={{ text: displayValue ?? placeholder ?? '' }}
      >
        <View
          style={[
            styles.trigger,
            {
              backgroundColor: disabled
                ? theme.colors.background.secondary
                : theme.colors.background.elevated,
              borderColor,
            },
          ]}
        >
          {icon && <Icon icon={icon} size="md" tone="muted" />}
          <Typography
            variant="body"
            tone={hasValue ? 'primary' : 'muted'}
            numberOfLines={1}
            style={styles.value}
          >
            {displayValue ?? placeholder ?? 'Seçin'}
          </Typography>
          <Icon icon={trailingIcon} size="md" tone="muted" />
        </View>
      </Touchable>
    </FieldShell>
  );
}

export interface SelectProps<T extends string = string> extends TriggerProps {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  /** Renders the options inline instead of behind a trigger. */
  inline?: boolean;
}

export function Select<T extends string = string>({
  options,
  value,
  onChange,
  inline = false,
  ...trigger
}: SelectProps<T>) {
  const selected = options.find((o) => o.value === value);

  if (!inline) {
    return <FieldTrigger {...trigger} displayValue={selected?.label} />;
  }

  return (
    <FieldShell
      label={trigger.label}
      helperText={trigger.helperText}
      errorText={trigger.errorText}
      required={trigger.required}
      disabled={trigger.disabled}
      style={trigger.style}
    >
      <OptionList
        options={options}
        selected={value ? [value] : []}
        onToggle={(v) => onChange(v)}
      />
    </FieldShell>
  );
}

export interface MultiSelectProps<T extends string = string> extends TriggerProps {
  options: SelectOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  inline?: boolean;
  /** Summary shown on the trigger when more than this many are selected. */
  summariseAfter?: number;
}

export function MultiSelect<T extends string = string>({
  options,
  values,
  onChange,
  inline = false,
  summariseAfter = 2,
  ...trigger
}: MultiSelectProps<T>) {
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  const labels = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  const display =
    labels.length === 0
      ? undefined
      : labels.length > summariseAfter
        ? `${labels.slice(0, summariseAfter).join(', ')} +${labels.length - summariseAfter}`
        : labels.join(', ');

  if (!inline) return <FieldTrigger {...trigger} displayValue={display} />;

  return (
    <FieldShell
      label={trigger.label}
      helperText={trigger.helperText}
      errorText={trigger.errorText}
      required={trigger.required}
      disabled={trigger.disabled}
      style={trigger.style}
    >
      <OptionList options={options} selected={values} onToggle={toggle} multi />
    </FieldShell>
  );
}

/** Shared option list — used inline and inside picker sheets. */
export function OptionList<T extends string = string>({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: SelectOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  multi?: boolean;
}) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={{ gap: theme.spacing['2xs'] }}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Touchable
            key={option.value}
            onPress={option.disabled ? undefined : () => onToggle(option.value)}
            disabled={option.disabled}
            feedback="opacity"
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: isSelected, disabled: !!option.disabled }}
            accessibilityLabel={option.label}
          >
            <View
              style={[
                styles.optionRow,
                {
                  backgroundColor: isSelected
                    ? theme.colors.action.secondary
                    : 'transparent',
                },
                option.disabled && { opacity: theme.opacity.disabled },
              ]}
            >
              {option.icon && (
                <Icon
                  icon={option.icon}
                  size="md"
                  color={isSelected ? theme.colors.text.accent : theme.colors.text.muted}
                />
              )}
              <View style={styles.optionLabels}>
                <Typography
                  variant="body"
                  tone={isSelected ? 'accent' : 'primary'}
                  numberOfLines={1}
                >
                  {option.label}
                </Typography>
                {option.hint && (
                  <Typography variant="micro" tone="muted" numberOfLines={1}>
                    {option.hint}
                  </Typography>
                )}
              </View>
              {isSelected && (
                <Icon icon={Check} size="md" color={theme.colors.text.accent} strokeWidth={2.5} />
              )}
            </View>
          </Touchable>
        );
      })}
    </View>
  );
}
