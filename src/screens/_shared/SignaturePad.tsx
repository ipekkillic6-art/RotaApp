import { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Touchable, Typography, useTheme } from '../../design-system';

export interface SignaturePadProps {
  height?: number;
  /** İmza değişince (boş/dolu) haber verir. */
  onChange?: (hasSignature: boolean) => void;
}

/**
 * Parmakla imza alanı — yeni paket EKLEMEDEN, react-native-svg + PanResponder.
 * Çizgiler SVG Path olarak biriktirilir; "Temizle" ile sıfırlanır.
 */
export function SignaturePad({ height = 180, onChange }: SignaturePadProps) {
  const theme = useTheme();
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef('');
  const [, force] = useState(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        force((n) => n + 1);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        force((n) => n + 1);
      },
      onPanResponderRelease: () => {
        setPaths((prev) => {
          const next = [...prev, current.current];
          onChange?.(next.length > 0);
          return next;
        });
        current.current = '';
      },
    }),
  ).current;

  const clear = () => {
    setPaths([]);
    current.current = '';
    onChange?.(false);
    force((n) => n + 1);
  };

  const isEmpty = paths.length === 0 && current.current === '';

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        {...responder.panHandlers}
        style={{
          height,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.background.secondary,
          borderWidth: theme.borderWidth.hairline,
          borderColor: theme.colors.border.default,
          overflow: 'hidden',
        }}
      >
        <Svg width="100%" height="100%">
          {paths.map((d, i) => (
            <Path
              key={i}
              d={d}
              stroke={theme.colors.text.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {current.current !== '' && (
            <Path
              d={current.current}
              stroke={theme.colors.text.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        {isEmpty && (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
            <Typography variant="micro" tone="muted">
              İmza alanı — parmakla imzalayın
            </Typography>
          </View>
        )}
      </View>
      {!isEmpty && (
        <Touchable onPress={clear} feedback="opacity" accessibilityLabel="İmzayı temizle">
          <Typography variant="caption" tone="accent" weight="semibold">
            Temizle
          </Typography>
        </Touchable>
      )}
    </View>
  );
}
