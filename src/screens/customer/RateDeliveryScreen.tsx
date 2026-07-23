import React, { useState } from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import {
  AppHeader,
  Avatar,
  Button,
  Icon,
  ScrollContainer,
  Surface,
  TextField,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { RATING_TAGS } from '../../mocks/analytics';
import { hitSlopFor } from '../../design-system/tokens';
import type { Courier } from '../../types';

export interface RateDeliveryScreenProps {
  courier?: Courier;
  trackingNumber: string;
  /** Pre-set score, used by stories. */
  rating?: number;
  submitting?: boolean;
  onSubmit?: (rating: number, tags: string[], comment: string) => void;
  onBack?: () => void;
}

/**
 * Post-delivery rating.
 *
 * Tags are offered instead of demanding free text: a tapped tag is structured
 * feedback ops can act on, whereas an empty comment box gets skipped. The
 * comment stays available but optional.
 */
export function RateDeliveryScreen({
  courier,
  trackingNumber,
  rating: initialRating = 0,
  submitting = false,
  onSubmit,
  onBack,
}: RateDeliveryScreenProps) {
  const theme = useTheme();
  const [rating, setRating] = useState(initialRating);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const toggleTag = (tag: string) =>
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );

  const RATING_LABELS = ['', 'Çok kötü', 'Kötü', 'İdare eder', 'İyi', 'Mükemmel'];

  return (
    <ScreenScaffold
      header={<AppHeader title="Teslimatı puanla" subtitle={trackingNumber} onBack={onBack} />}
      footer={
        <Button
          label="Gönder"
          onPress={() => onSubmit?.(rating, tags, comment)}
          disabled={rating === 0}
          loading={submitting}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
          {courier && (
            <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
              <Avatar name={courier.fullName} imageUrl={courier.avatarUrl} size="xl" />
              <Typography variant="h3">{courier.fullName}</Typography>
              <Typography variant="bodySm" tone="secondary" align="center">
                Teslimat deneyimin nasıldı?
              </Typography>
            </View>
          )}

          {/* ── Stars ──────────────────────────────────────────────── */}
          <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
            <View
              style={{ flexDirection: 'row', gap: theme.spacing.sm }}
              accessibilityRole="adjustable"
              accessibilityLabel="Puan"
              accessibilityValue={{ min: 1, max: 5, now: rating }}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <Touchable
                  key={value}
                  onPress={() => setRating(value)}
                  feedback="control"
                  accessibilityLabel={`${value} yıldız`}
                  hitSlop={hitSlopFor(40)}
                >
                  <Icon
                    icon={Star}
                    size={40}
                    color={
                      value <= rating
                        ? theme.colors.feedback.warning
                        : theme.colors.border.strong
                    }
                    strokeWidth={value <= rating ? 2.5 : 1.75}
                  />
                </Touchable>
              ))}
            </View>
            <Typography variant="caption" tone={rating ? 'primary' : 'muted'}>
              {rating ? RATING_LABELS[rating] : 'Puan vermek için dokun'}
            </Typography>
          </View>

          {/* ── Tags ───────────────────────────────────────────────── */}
          <View style={{ gap: theme.spacing.sm }}>
            <Typography variant="h3">Ne iyi gitti?</Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {RATING_TAGS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <Touchable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    feedback="opacity"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={tag}
                  >
                    <View
                      style={{
                        paddingVertical: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.lg,
                        borderRadius: theme.radius.full,
                        minHeight: 40,
                        justifyContent: 'center',
                        backgroundColor: selected
                          ? theme.colors.action.secondary
                          : theme.colors.background.elevated,
                        borderWidth: theme.borderWidth.hairline,
                        borderColor: selected
                          ? theme.colors.action.primary
                          : theme.colors.border.default,
                      }}
                    >
                      <Typography
                        variant="caption"
                        tone={selected ? 'accent' : 'secondary'}
                        weight={selected ? 'semibold' : 'medium'}
                      >
                        {tag}
                      </Typography>
                    </View>
                  </Touchable>
                );
              })}
            </View>
          </View>

          {/* ── Comment ────────────────────────────────────────────── */}
          <TextField
            label="Yorumun (isteğe bağlı)"
            placeholder="Deneyimini birkaç cümleyle anlat"
            value={comment}
            onChangeText={setComment}
            multiline
            rows={4}
            maxLength={300}
            showCounter
          />

          <Surface tone="sunken" radius="md" padding="md">
            <Typography variant="micro" tone="muted">
              Puanın kurye ile paylaşılır, yorumun yalnızca operasyon ekibi tarafından
              görülür.
            </Typography>
          </Surface>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
