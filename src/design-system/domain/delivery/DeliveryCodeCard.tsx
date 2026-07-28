import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyRound, ShieldCheck } from 'lucide-react-native';
import { useTheme, useThemedStyles, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Surface } from '../../foundations/Surface';
import { Typography } from '../../foundations/Typography';

export interface DeliveryCodeCardProps {
  /** 4 or 6 digits. `undefined` renders the "not issued yet" state. */
  code?: string;
  /** Hides the digits behind dots until the courier arrives. */
  hidden?: boolean;
  style?: StyleProp<ViewStyle>;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { gap: theme.spacing.md, alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    digits: { flexDirection: 'row', gap: theme.spacing.sm },
    cell: {
      width: 44,
      height: 56,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.elevated,
      borderWidth: theme.borderWidth.hairline,
      borderColor: theme.colors.border.default,
    },
  });

/**
 * The code the customer reads out to the courier at handover.
 *
 * Rendered large and spaced because it is read aloud across a doorway, often
 * in poor light — this is the one place in the app where display size beats
 * density. Tabular figures keep the cells from jittering.
 */
export function DeliveryCodeCard({ code, hidden = false, style }: DeliveryCodeCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  const digits = code ? code.split('') : [];

  return (
    <Surface
      tone="brand"
      radius="lg"
      padding="lg"
      style={[styles.root, style]}
    >
      <View style={styles.header}>
        <Icon icon={ShieldCheck} size="sm" tone="accent" />
        <Typography variant="micro" tone="accent" overline>
          Teslimat kodu
        </Typography>
      </View>

      {code ? (
        <View
          style={styles.digits}
          accessibilityLabel={`Teslimat kodu ${hidden ? 'gizli' : digits.join(' ')}`}
        >
          {digits.map((digit, i) => (
            <View key={i} style={styles.cell}>
              <Typography variant="h1" tabular>
                {hidden ? '•' : digit}
              </Typography>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <Icon icon={KeyRound} size="lg" tone="muted" />
          <Typography variant="bodySm" tone="secondary" align="center">
            Kod, kurye paketi aldığında oluşturulacak.
          </Typography>
        </View>
      )}

      {code && (
        <Typography variant="micro" tone="secondary" align="center">
          Bu kodu yalnızca paketi teslim alırken kuryeyle paylaş.
        </Typography>
      )}
    </Surface>
  );
}
