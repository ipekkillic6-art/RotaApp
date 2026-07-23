import React from 'react';
import { Search } from 'lucide-react-native';
import { TextField, type TextFieldProps } from './TextField';

export interface SearchFieldProps
  extends Omit<TextFieldProps, 'icon' | 'clearable' | 'label' | 'multiline'> {
  /** Announced to screen readers; visible label is intentionally omitted. */
  accessibilityLabel?: string;
}

/**
 * Search input.
 *
 * A wrapper rather than a variant flag on TextField, because a search field
 * has a fixed contract (magnifier, clearable, no visible label, search return
 * key) and encoding that once beats repeating four props at every call site.
 */
export function SearchField({
  placeholder = 'Ara',
  accessibilityLabel = 'Ara',
  ...rest
}: SearchFieldProps) {
  return (
    <TextField
      icon={Search}
      clearable
      placeholder={placeholder}
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      {...rest}
    />
  );
}
