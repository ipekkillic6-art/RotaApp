import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Surface } from '../../foundations/Surface';
import { Typography } from '../../foundations/Typography';
import { ChoiceCard } from '../../components/forms/ChoiceCard';
import { PACKAGE_TYPES, packageTypeMeta } from '../delivery/status';
import type { PackageTypeId } from '../../../types';

export interface PackageInfoCardProps {
  type: PackageTypeId;
  description?: string;
  /** Optional declared weight, in kg. */
  weightKg?: number;
  /** Extra handling notes shown as chips. */
  notes?: string[];
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' },
    iconWell: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.action.secondary,
    },
    body: { flex: 1, gap: 2 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  });

/** Read-only summary of what is being carried. */
export function PackageInfoCard({
  type,
  description,
  weightKg,
  notes,
  style,
}: PackageInfoCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const meta = packageTypeMeta(type);

  return (
    <Surface tone="elevated" radius="lg" padding="lg" bordered style={style}>
      <View style={styles.row}>
        <View style={styles.iconWell}>
          <Icon icon={meta.icon} size="lg" tone="accent" />
        </View>
        <View style={styles.body}>
          <Typography variant="micro" tone="muted" overline>
            Paket
          </Typography>
          <Typography variant="bodyStrong">
            {meta.label}
            {weightKg !== undefined ? ` · ${weightKg} kg` : ''}
          </Typography>
          <Typography variant="micro" tone="secondary">
            {description ?? meta.hint}
          </Typography>
          {notes && notes.length > 0 && (
            <View style={[styles.chips, { marginTop: theme.spacing.xs }]}>
              {notes.map((note) => (
                <Typography key={note} variant="micro" tone="accent">
                  · {note}
                </Typography>
              ))}
            </View>
          )}
        </View>
      </View>
    </Surface>
  );
}

export interface PackageTypeSelectorProps {
  value?: PackageTypeId;
  onChange: (value: PackageTypeId) => void;
  /** Restricts the offered types — a bicycle courier cannot take "büyük". */
  available?: PackageTypeId[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Package type picker.
 *
 * A vertical list of rows rather than a grid of tiles: the hint line ("30×30
 * cm’e kadar · 0-3 kg") is what actually decides the choice, and it does not
 * fit in a tile without truncation.
 */
export function PackageTypeSelector({
  value,
  onChange,
  available,
  style,
}: PackageTypeSelectorProps) {
  const theme = useTheme();
  const options = available
    ? PACKAGE_TYPES.filter((p) => available.includes(p.id))
    : PACKAGE_TYPES;

  return (
    <View style={[{ gap: theme.spacing.sm }, style]} accessibilityRole="radiogroup">
      {options.map((option) => (
        <ChoiceCard
          key={option.id}
          label={option.label}
          hint={option.hint}
          icon={option.icon}
          selected={value === option.id}
          onPress={() => onChange(option.id)}
        />
      ))}
    </View>
  );
}
