import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { FieldTrigger } from './Select';
import type { StyleProp, ViewStyle } from 'react-native';

interface TriggerBase {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface DatePickerTriggerProps extends TriggerBase {
  /** Already-formatted date; formatting belongs to the caller's locale layer. */
  value?: string;
  placeholder?: string;
}

/**
 * Opens the platform date picker. The picker itself is not part of the design
 * system — RN's native picker is the right answer and wrapping it would only
 * add a dependency and a worse experience.
 */
export function DatePickerTrigger({
  value,
  placeholder = 'Tarih seçin',
  ...rest
}: DatePickerTriggerProps) {
  return (
    <FieldTrigger
      {...rest}
      icon={Calendar}
      placeholder={placeholder}
      displayValue={value}
    />
  );
}

export interface TimePickerTriggerProps extends TriggerBase {
  value?: string;
  placeholder?: string;
}

export function TimePickerTrigger({
  value,
  placeholder = 'Saat aralığı seçin',
  ...rest
}: TimePickerTriggerProps) {
  return (
    <FieldTrigger
      {...rest}
      icon={Clock}
      placeholder={placeholder}
      displayValue={value}
    />
  );
}

export interface AddressFieldProps extends TriggerBase {
  value?: string;
  placeholder?: string;
}

/** Opens the address picker screen — never a free-text field. */
export function AddressField({
  value,
  placeholder = 'Adres seçin',
  ...rest
}: AddressFieldProps) {
  return (
    <FieldTrigger
      {...rest}
      icon={MapPin}
      placeholder={placeholder}
      displayValue={value}
    />
  );
}
