import React, { useState } from 'react';
import { View } from 'react-native';
import { MapPin, ShieldCheck, Zap, type LucideIcon } from 'lucide-react-native';
import {
  Button,
  Icon,
  SafeAreaContainer,
  ScreenContainer,
  Typography,
  useTheme,
} from '../../design-system';

interface Slide {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: Zap,
    title: 'Teslimatını 30 saniyede oluştur',
    description:
      'Adresi seç, paketi tanımla, gönder. Fiyatı onaylamadan önce net olarak görürsün.',
  },
  {
    icon: MapPin,
    title: 'Kuryeyi canlı takip et',
    description:
      'Paketin hangi aşamada olduğunu adım adım gör, tahmini varış süresini anlık izle.',
  },
  {
    icon: ShieldCheck,
    title: 'Teslimatı kodla doğrula',
    description:
      'Her teslimatın kendine ait kodu var. Paket yalnızca doğru kişiye teslim edilir.',
  },
];

export interface OnboardingScreenProps {
  /** Controlled index — stories drive this to show a specific slide. */
  index?: number;
  onFinish?: () => void;
  onSkip?: () => void;
}

/**
 * Three-slide intro.
 *
 * Each slide states a concrete capability, not a mood — "teslimatını 30
 * saniyede oluştur" is checkable, "hayatını kolaylaştır" is not.
 */
export function OnboardingScreen({ index: controlled, onFinish, onSkip }: OnboardingScreenProps) {
  const theme = useTheme();
  const [internal, setInternal] = useState(0);
  const index = controlled ?? internal;
  const slide = SLIDES[Math.min(index, SLIDES.length - 1)];
  const isLast = index === SLIDES.length - 1;

  return (
    <ScreenContainer>
      <SafeAreaContainer>
        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.layout.screenPaddingX,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ alignItems: 'flex-end', paddingTop: theme.spacing.sm }}>
            {!isLast && (
              <Button label="Geç" variant="ghost" size="sm" fullWidth={false} onPress={onSkip} />
            )}
          </View>

          <View style={{ alignItems: 'center', gap: theme.spacing.xl }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: theme.radius['3xl'],
                backgroundColor: theme.colors.background.brandSubtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={slide.icon} size={56} tone="accent" strokeWidth={1.5} />
            </View>

            <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
              <Typography variant="h1" align="center">
                {slide.title}
              </Typography>
              <Typography
                variant="body"
                tone="secondary"
                align="center"
                style={{ maxWidth: 320 }}
              >
                {slide.description}
              </Typography>
            </View>
          </View>

          <View style={{ gap: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
            <View
              style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}
              accessibilityLabel={`${index + 1}. adım, toplam ${SLIDES.length}`}
            >
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 22 : 8,
                    height: 8,
                    borderRadius: theme.radius.full,
                    backgroundColor:
                      i === index ? theme.colors.action.primary : theme.colors.border.strong,
                  }}
                />
              ))}
            </View>

            <Button
              label={isLast ? 'Başla' : 'Devam et'}
              onPress={() => {
                if (isLast) onFinish?.();
                else setInternal((i) => i + 1);
              }}
            />
          </View>
        </View>
      </SafeAreaContainer>
    </ScreenContainer>
  );
}
