import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Route, Timer, Wallet } from 'lucide-react-native';
import {
  AddressBlock,
  Button,
  Icon,
  PackageInfoCard,
  SafeAreaContainer,
  ScreenContainer,
  ScrollContainer,
  Surface,
  Typography,
  useTheme,
} from '../../design-system';
import { formatDistance, formatDuration, formatPrice } from '../../utils/format';
import type { Delivery } from '../../types';

export interface JobOfferScreenProps {
  offer: Delivery;
  /** Seconds left to decide. */
  secondsLeft?: number;
  totalSeconds?: number;
  accepting?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

/**
 * Incoming job offer.
 *
 * The three numbers that decide the answer — money, distance, time — are the
 * largest things on the screen, above the addresses. A courier decides this in
 * about two seconds, often at a traffic light, so everything else is secondary.
 *
 * The countdown ring is the one place a continuous animation is justified: it
 * conveys a real deadline. Under reduced motion it becomes a static number.
 */
export function JobOfferScreen({
  offer,
  secondsLeft = 22,
  totalSeconds = 30,
  accepting = false,
  onAccept,
  onReject,
}: JobOfferScreenProps) {
  const theme = useTheme();
  const [remaining] = useState(secondsLeft);
  const progress = useRef(new Animated.Value(remaining / totalSeconds)).current;

  useEffect(() => {
    if (theme.reducedMotion) {
      progress.setValue(remaining / totalSeconds);
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: remaining * 1000,
      easing: theme.easing.linear,
      useNativeDriver: false,
    }).start();
  }, [progress, remaining, totalSeconds, theme]);

  const urgent = remaining <= 10;

  const highlight = (
    icon: typeof Wallet,
    value: string,
    label: string,
    emphasis = false,
  ) => (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Icon
        icon={icon}
        size="md"
        color={emphasis ? theme.colors.feedback.success : theme.colors.text.secondary}
      />
      <Typography
        variant={emphasis ? 'h2' : 'h3'}
        tone={emphasis ? 'success' : 'primary'}
        tabular
      >
        {value}
      </Typography>
      <Typography variant="micro" tone="muted">
        {label}
      </Typography>
    </View>
  );

  return (
    <ScreenContainer tone="sunken">
      <SafeAreaContainer>
        <ScrollContainer>
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
            {/* ── Countdown ──────────────────────────────────────────── */}
            <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
              <Typography variant="micro" tone="muted" overline>
                Yeni görev teklifi
              </Typography>
              <Typography
                variant="display"
                tone={urgent ? 'danger' : 'primary'}
                tabular
                accessibilityLabel={`${remaining} saniye kaldı`}
              >
                {remaining}s
              </Typography>
              <View
                style={{
                  width: '60%',
                  height: 4,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.border.subtle,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    height: 4,
                    borderRadius: theme.radius.full,
                    backgroundColor: urgent
                      ? theme.colors.feedback.error
                      : theme.colors.role.courier,
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            </View>

            {/* ── The three numbers ──────────────────────────────────── */}
            <Surface
              tone="elevated"
              radius="xl"
              padding="xl"
              elevation="md"
              style={{ flexDirection: 'row' }}
            >
              {highlight(
                Wallet,
                formatPrice(offer.price?.total ?? 0, { compact: true }),
                'kazanç',
                true,
              )}
              {highlight(Route, formatDistance(offer.distanceKm), 'mesafe')}
              {highlight(
                Timer,
                formatDuration(offer.estimatedDurationMinutes),
                'tahmini süre',
              )}
            </Surface>

            {/* ── Route ──────────────────────────────────────────────── */}
            <Surface tone="elevated" radius="lg" padding="lg" bordered>
              <AddressBlock
                pickup={offer.pickupAddress}
                dropoff={offer.dropoffAddress}
              />
            </Surface>

            <PackageInfoCard
              type={offer.packageType}
              description={offer.packageDescription}
            />
          </View>
        </ScrollContainer>

        <View
          style={{
            paddingHorizontal: theme.layout.screenPaddingX,
            paddingTop: theme.spacing.md,
            gap: theme.spacing.sm,
            borderTopWidth: theme.borderWidth.hairline,
            borderTopColor: theme.colors.border.subtle,
            backgroundColor: theme.colors.background.elevated,
          }}
        >
          <Button label="Görevi kabul et" size="lg" onPress={onAccept} loading={accepting} />
          <Button label="Reddet" variant="tertiary" onPress={onReject} disabled={accepting} />
        </View>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}
