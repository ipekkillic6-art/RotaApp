import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme, type Theme } from '../../themes';
import { Icon } from '../../foundations/Icon';
import { Typography } from '../../foundations/Typography';
import { Timeline, type TimelineItem } from '../../components/data-display/Timeline';
import { InlineAlert } from '../../components/feedback/InlineAlert';
import type { Delivery, DeliveryStatus, StatusEvent } from '../../../types';
import { HAPPY_PATH, STATUS_META, statusPalette } from './status';
import { formatTime } from '../../../utils/format';

export interface DeliveryStatusStepperProps {
  status: DeliveryStatus;
  /** Vertical adds timestamps and descriptions; horizontal is a compact rail. */
  orientation?: 'horizontal' | 'vertical';
  /** Real event times. Missing entries render as "upcoming". */
  history?: StatusEvent[];
  /** Condenses the horizontal rail to the milestones a customer cares about. */
  milestonesOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Steps a customer is shown when `milestonesOnly` — the rest is noise to them. */
const MILESTONES: DeliveryStatus[] = ['pending', 'accepted', 'picked_up', 'on_the_way', 'delivered'];

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    rail: { flexDirection: 'row', alignItems: 'flex-start' },
    step: { alignItems: 'center', flex: 1, gap: theme.spacing.xs },
    marker: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    connector: {
      height: 2,
      flex: 1,
      marginTop: 15,
      marginHorizontal: -theme.spacing.xs,
    },
    label: { textAlign: 'center' },
  });

/**
 * Where a delivery is on its path.
 *
 * Terminal failures (`failed`, `cancelled`) leave the happy path, so the
 * stepper does not try to place them on it — it freezes the rail at the last
 * successful step and states the outcome separately. Pretending "iptal
 * edildi" is step 7 of 7 would be actively misleading.
 */
export function DeliveryStatusStepper({
  status,
  orientation = 'horizontal',
  history,
  milestonesOnly = false,
  style,
}: DeliveryStatusStepperProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const derailed = STATUS_META[status].step === -1;
  const reachedIndex = derailed
    ? lastReachedIndex(history)
    : HAPPY_PATH.indexOf(status);

  const steps = milestonesOnly ? MILESTONES : HAPPY_PATH;
  const timeFor = (s: DeliveryStatus) => {
    const event = history?.find((h) => h.status === s);
    return event ? formatTime(event.at) : undefined;
  };

  if (orientation === 'vertical') {
    const items: TimelineItem[] = steps.map((s) => {
      const index = HAPPY_PATH.indexOf(s);
      const meta = STATUS_META[s];
      const reached = index <= reachedIndex;
      return {
        id: s,
        title: meta.label,
        description: meta.description,
        timestamp: timeFor(s),
        icon: meta.icon,
        color: statusPalette(theme, s).color,
        upcoming: !reached,
        current: !derailed && index === reachedIndex,
      };
    });

    if (derailed) {
      const meta = STATUS_META[status];
      items.push({
        id: status,
        title: meta.label,
        description: meta.description,
        timestamp: timeFor(status),
        icon: meta.icon,
        color: statusPalette(theme, status).color,
        current: true,
      });
    }

    return <Timeline items={items} style={style} />;
  }

  return (
    <View style={style}>
      <View style={styles.rail} accessibilityLabel={`Durum: ${STATUS_META[status].label}`}>
        {steps.map((s, i) => {
          const index = HAPPY_PATH.indexOf(s);
          const reached = index <= reachedIndex;
          const isCurrent = !derailed && index === reachedIndex;
          const palette = statusPalette(theme, s);
          const meta = STATUS_META[s];

          return (
            <React.Fragment key={s}>
              {i > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: reached
                        ? theme.colors.action.primary
                        : theme.colors.border.default,
                    },
                  ]}
                />
              )}
              <View style={styles.step}>
                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor: reached
                        ? palette.color
                        : theme.colors.background.secondary,
                    },
                    isCurrent && {
                      borderWidth: 3,
                      borderColor: theme.colors.background.brandSubtle,
                    },
                  ]}
                >
                  <Icon
                    icon={meta.icon}
                    size={15}
                    color={reached ? theme.colors.text.inverse : theme.colors.text.muted}
                    strokeWidth={2.25}
                  />
                </View>
                <Typography
                  variant="tiny"
                  tone={reached ? 'secondary' : 'muted'}
                  weight={isCurrent ? 'semibold' : 'medium'}
                  numberOfLines={2}
                  style={styles.label}
                >
                  {meta.label}
                </Typography>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {derailed && (
        <InlineAlert
          tone={status === 'failed' ? 'error' : 'warning'}
          title={STATUS_META[status].label}
          message={STATUS_META[status].description}
          icon={STATUS_META[status].icon}
          style={{ marginTop: theme.spacing.md }}
        />
      )}
    </View>
  );
}

/** How far along the happy path the delivery got before it derailed. */
function lastReachedIndex(history?: StatusEvent[]): number {
  if (!history) return -1;
  return history.reduce((max, event) => {
    const i = HAPPY_PATH.indexOf(event.status);
    return i > max ? i : max;
  }, -1);
}

/**
 * Convenience wrapper — the full history of one delivery as a vertical rail.
 * Used by the detail screens for customer, courier and ops alike.
 */
export function DeliveryTimeline({
  delivery,
  style,
}: {
  delivery: Delivery;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <DeliveryStatusStepper
      status={delivery.status}
      history={delivery.history}
      orientation="vertical"
      style={style}
    />
  );
}
