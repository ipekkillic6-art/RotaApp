import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Route } from 'lucide-react-native';
import { Icon, ScreenContainer, Typography, useTheme } from '../../design-system';

/**
 * Splash.
 *
 * The mark is a route glyph rather than a scooter: the product is about the
 * path a package takes, and a vehicle icon would pin the brand to one of four
 * vehicle types. The loading bar is indeterminate and slow — it signals
 * "working", not a fake percentage.
 */
export function SplashScreen() {
  const theme = useTheme();
  const enter = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (theme.reducedMotion) {
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, {
      toValue: 1,
      duration: theme.duration.deliberate,
      easing: theme.easing.enter,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1400,
        easing: theme.easing.standard,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, sweep, theme]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const sweepX = sweep.interpolate({ inputRange: [0, 1], outputRange: [-90, 90] });

  return (
    <ScreenContainer>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl }}>
        <Animated.View
          style={{
            alignItems: 'center',
            gap: theme.spacing.md,
            opacity: enter,
            transform: [{ translateY }],
          }}
        >
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: theme.radius['2xl'],
              backgroundColor: theme.colors.action.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadows.brand,
            }}
          >
            <Icon icon={Route} size={44} color={theme.colors.text.inverse} strokeWidth={2.25} />
          </View>

          <Typography variant="display">Rota</Typography>
          <Typography variant="bodySm" tone="secondary">
            Paketin nerede olduğunu bilmek
          </Typography>
        </Animated.View>

        {/* Indeterminate sweep — no fake percentage. */}
        <View
          style={{
            width: 90,
            height: 3,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.border.subtle,
            overflow: 'hidden',
          }}
          accessibilityRole="progressbar"
          accessibilityLabel="Yükleniyor"
        >
          <Animated.View
            style={{
              width: 44,
              height: 3,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.action.primary,
              transform: [{ translateX: sweepX }],
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
