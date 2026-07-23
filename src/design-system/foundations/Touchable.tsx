import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../themes';

export interface TouchableProps extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  /** How firmly the press reads. `card` is a softer scale for large surfaces. */
  feedback?: 'control' | 'card' | 'opacity' | 'none';
  style?: StyleProp<ViewStyle>;
}

/**
 * Press feedback, once, for the whole system.
 *
 * Scale + opacity are the only two properties animated, they run on the
 * native driver, and both are skipped entirely when the user has reduced
 * motion enabled — in that case the press still reports via opacity, which is
 * a state change rather than motion.
 */
export function Touchable({
  children,
  feedback = 'control',
  style,
  disabled,
  accessibilityRole = 'button',
  ...rest
}: TouchableProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (pressed: boolean) => {
      if (feedback === 'none' || disabled) return;

      const target = pressed
        ? feedback === 'card'
          ? theme.press.cardScale
          : theme.press.scale
        : 1;

      Animated.parallel([
        ...(feedback === 'opacity' || theme.reducedMotion
          ? []
          : [
              Animated.timing(scale, {
                toValue: target,
                duration: theme.duration.instant,
                easing: theme.easing.standard,
                useNativeDriver: true,
              }),
            ]),
        Animated.timing(opacity, {
          toValue: pressed ? theme.press.opacity : 1,
          duration: theme.duration.instant,
          easing: theme.easing.standard,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [feedback, disabled, theme, scale, opacity],
  );

  return (
    <Pressable
      onPressIn={() => animate(true)}
      onPressOut={() => animate(false)}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: !!disabled }}
      style={style}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
