import React, { useState } from 'react';
import { Image, View } from 'react-native';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  TriangleAlert,
} from 'lucide-react-native';
import {
  AddressBlock,
  AddressCard,
  AppHeader,
  Button,
  DeliveryCard,
  DeliveryStatusStepper,
  Divider,
  Icon,
  IconButton,
  InlineAlert,
  MapPreview,
  OtpInput,
  PackageInfoCard,
  ScrollContainer,
  SegmentedControl,
  SkeletonList,
  StateView,
  STATE_PRESETS,
  Surface,
  TextField,
  Touchable,
  Typography,
  useTheme,
} from '../../design-system';
import { ScreenScaffold } from '../_shared/ScreenScaffold';
import { CameraCaptureModal } from '../_shared/CameraCaptureModal';
import { SignaturePad } from '../_shared/SignaturePad';
import { formatDistance, formatDuration } from '../../utils/format';
import type { Delivery, FailureReason } from '../../types';
import { FAILURE_REASONS } from '../../design-system/domain/delivery/status';

/* ── Task list ──────────────────────────────────────────────────────────── */

export type TaskTab = 'new' | 'active' | 'done' | 'rejected';

export interface CourierTaskListScreenProps {
  tasks: Record<TaskTab, Delivery[]>;
  tab?: TaskTab;
  loading?: boolean;
  onOpenTask?: (delivery: Delivery) => void;
  onTabChange?: (key: string) => void;
}

export function CourierTaskListScreen({
  tasks,
  tab: initialTab = 'active',
  loading = false,
  onOpenTask,
  onTabChange,
}: CourierTaskListScreenProps) {
  const theme = useTheme();
  const [tab, setTab] = useState<TaskTab>(initialTab);
  const list = tasks[tab];

  return (
    <ScreenScaffold
      header={
        <View>
          <AppHeader title="Görevlerim" />
          <View style={{ paddingHorizontal: theme.layout.screenPaddingX }}>
            <SegmentedControl
              variant="underline"
              value={tab}
              onChange={setTab}
              accentColor={theme.colors.role.courier}
              scrollable
              options={[
                { value: 'new', label: 'Yeni', count: tasks.new.length },
                { value: 'active', label: 'Aktif', count: tasks.active.length },
                { value: 'done', label: 'Tamamlanan', count: tasks.done.length },
                { value: 'rejected', label: 'Reddedilen', count: tasks.rejected.length },
              ]}
            />
          </View>
        </View>
      }
      role="courier"
      activeTab="tasks"
      onTabChange={onTabChange}
      tone="sunken"
    >
      <ScrollContainer bottomInset={theme.chrome.tabBar}>
        <View style={{ gap: theme.layout.listGap, paddingTop: theme.spacing.md }}>
          {loading ? (
            <SkeletonList count={3} />
          ) : list.length === 0 ? (
            <StateView {...STATE_PRESETS.noActiveTasks} />
          ) : (
            list.map((task, i) => (
              <DeliveryCard
                key={task.id + i}
                delivery={task}
                variant="courier"
                onPress={() => onOpenTask?.(task)}
                primaryAction={
                  tab === 'new'
                    ? { label: 'Kabul et', onPress: () => {} }
                    : tab === 'active'
                      ? { label: 'Devam et', onPress: () => onOpenTask?.(task) }
                      : undefined
                }
              />
            ))
          )}
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/* ── Task detail ────────────────────────────────────────────────────────── */

export interface CourierTaskDetailScreenProps {
  task: Delivery;
  onBack?: () => void;
  onStart?: () => void;
  onUpdateStatus?: () => void;
  onNavigate?: () => void;
  onCall?: () => void;
}

export function CourierTaskDetailScreen({
  task,
  onBack,
  onStart,
  onUpdateStatus,
  onNavigate,
  onCall,
}: CourierTaskDetailScreenProps) {
  const theme = useTheme();
  const started = task.status !== 'assigned' && task.status !== 'accepted';

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Görev detayı"
          subtitle={task.trackingNumber}
          onBack={onBack}
          actions={[
            { icon: Phone, accessibilityLabel: 'Müşteriyi ara', onPress: onCall ?? (() => {}) },
          ]}
          bordered
        />
      }
      tone="sunken"
      footer={
        <Button
          label={started ? 'Durumu güncelle' : 'Görevi başlat'}
          onPress={started ? onUpdateStatus : onStart}
        />
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <Surface tone="elevated" radius="lg" padding="lg" bordered>
            <DeliveryStatusStepper status={task.status} history={task.history} milestonesOnly />
          </Surface>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ flex: 1, gap: 2 }}>
              <Typography variant="micro" tone="muted" overline>
                Mesafe
              </Typography>
              <Typography variant="h3" tabular>
                {formatDistance(task.distanceKm)}
              </Typography>
            </Surface>
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ flex: 1, gap: 2 }}>
              <Typography variant="micro" tone="muted" overline>
                Tahmini süre
              </Typography>
              <Typography variant="h3" tabular>
                {formatDuration(task.estimatedDurationMinutes)}
              </Typography>
            </Surface>
          </View>

          <AddressCard address={task.pickupAddress} variant="pickup" />
          <AddressCard address={task.dropoffAddress} variant="dropoff" />

          <PackageInfoCard type={task.packageType} description={task.packageDescription} />

          <Button label="Yol tarifi al" icon={Navigation} variant="secondary" onPress={onNavigate} />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/* ── Pickup ─────────────────────────────────────────────────────────────── */

export interface PickupScreenProps {
  task: Delivery;
  /** Which sub-step of the pickup flow to show. */
  stage?: 'arriving' | 'arrived' | 'confirmed';
  photoAttached?: boolean;
  cameraPermission?: 'granted' | 'denied';
  onBack?: () => void;
  onAdvance?: () => void;
  onReportProblem?: () => void;
}

/**
 * Pickup flow.
 *
 * Three discrete taps — reached the address, took the package, done — instead
 * of one "picked up" button. Each tap is a timestamp ops can use when a
 * delivery is disputed, and each is reversible until the next one.
 */
export function PickupScreen({
  task,
  stage = 'arriving',
  photoAttached = false,
  cameraPermission = 'granted',
  onBack,
  onAdvance,
  onReportProblem,
}: PickupScreenProps) {
  const theme = useTheme();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const hasPhoto = photoAttached || !!photoUri;

  const label = {
    arriving: 'Adrese ulaştım',
    arrived: 'Paketi teslim aldım',
    confirmed: 'Teslimata başla',
  }[stage];

  return (
    <ScreenScaffold
      header={
        <AppHeader title="Paket alımı" subtitle={task.trackingNumber} onBack={onBack} bordered />
      }
      tone="sunken"
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button label={label} size="lg" onPress={onAdvance} />
          <Button
            label="Sorun bildir"
            variant="tertiary"
            icon={TriangleAlert}
            onPress={onReportProblem}
          />
        </View>
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <MapPreview height={160} caption={`${formatDistance(1.2)} · 6 dk`} showCourier />

          <AddressCard address={task.pickupAddress} variant="pickup" />

          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Gönderici doğrulaması</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="bodyStrong">
                  {task.pickupAddress.contactName ?? task.customerName}
                </Typography>
                <Typography variant="micro" tone="secondary">
                  {task.pickupAddress.contactPhone ?? '—'}
                </Typography>
              </View>
              <IconButton
                icon={Phone}
                accessibilityLabel="Göndericiyi ara"
                variant="filled"
                size="lg"
                onPress={() => {}}
              />
            </View>
          </Surface>

          <PackageInfoCard type={task.packageType} description={task.packageDescription} />

          {/* ── Photo ────────────────────────────────────────────── */}
          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <Typography variant="h3">Paket fotoğrafı</Typography>
            {cameraPermission === 'denied' ? (
              <StateView
                {...STATE_PRESETS.cameraPermission}
                size="compact"
                primaryAction={{ label: 'Ayarları aç', onPress: () => {} }}
              />
            ) : hasPhoto ? (
              <>
                {photoUri && (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ height: 160, borderRadius: theme.radius.md }}
                    resizeMode="cover"
                  />
                )}
                <InlineAlert
                  tone="success"
                  icon={CheckCircle2}
                  message="Fotoğraf eklendi. Anlaşmazlık durumunda kanıt olarak kullanılır."
                />
                {photoUri && (
                  <Touchable
                    onPress={() => setCameraOpen(true)}
                    feedback="opacity"
                    accessibilityLabel="Yeniden çek"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Typography variant="caption" tone="accent" weight="semibold">
                      Yeniden çek
                    </Typography>
                  </Touchable>
                )}
              </>
            ) : (
              <Touchable
                onPress={() => setCameraOpen(true)}
                feedback="card"
                accessibilityLabel="Fotoğraf ekle"
              >
                <View
                  style={{
                    height: 120,
                    borderRadius: theme.radius.md,
                    borderWidth: theme.borderWidth.thick,
                    borderStyle: 'dashed',
                    borderColor: theme.colors.border.strong,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.xs,
                  }}
                >
                  <Icon icon={Camera} size="xl" tone="muted" />
                  <Typography variant="caption" tone="secondary">
                    Fotoğraf ekle
                  </Typography>
                </View>
              </Touchable>
            )}
          </Surface>
        </View>
      </ScrollContainer>

      <CameraCaptureModal
        visible={cameraOpen}
        mode="photo"
        onClose={() => setCameraOpen(false)}
        onCapture={(uri) => setPhotoUri(uri)}
      />
    </ScreenScaffold>
  );
}

/* ── On the way ─────────────────────────────────────────────────────────── */

export interface OnTheWayScreenProps {
  task: Delivery;
  trafficDelayMinutes?: number;
  onBack?: () => void;
  onArrived?: () => void;
  onNavigate?: () => void;
  onCall?: () => void;
}

export function OnTheWayScreen({
  task,
  trafficDelayMinutes,
  onBack,
  onArrived,
  onNavigate,
  onCall,
}: OnTheWayScreenProps) {
  const theme = useTheme();

  return (
    <ScreenScaffold
      header={
        <AppHeader title="Yolda" subtitle={task.trackingNumber} onBack={onBack} bordered />
      }
      tone="sunken"
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label="Teslimat noktasına ulaştım"
            size="lg"
            icon={MapPin}
            onPress={onArrived}
          />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="Navigasyon" variant="secondary" icon={Navigation} onPress={onNavigate} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Müşteriyi ara" variant="tertiary" icon={Phone} onPress={onCall} />
            </View>
          </View>
        </View>
      }
    >
      <ScrollContainer>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <MapPreview
            height={220}
            showCourier
            caption={`Tahmini varış ${formatDuration(task.estimatedDurationMinutes)}`}
          />

          {trafficDelayMinutes ? (
            <InlineAlert
              tone="warning"
              title="Trafik yoğunluğu"
              message={`Güzergâhta ${trafficDelayMinutes} dk gecikme bekleniyor. Müşteri bilgilendirildi.`}
            />
          ) : null}

          <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
            <AddressBlock
              pickup={task.pickupAddress}
              dropoff={task.dropoffAddress}
              showContacts
            />
            <Divider />
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              <View style={{ gap: 2 }}>
                <Typography variant="micro" tone="muted" overline>
                  Kalan mesafe
                </Typography>
                <Typography variant="bodyStrong" tabular>
                  {formatDistance(task.distanceKm * 0.4)}
                </Typography>
              </View>
              <View style={{ gap: 2 }}>
                <Typography variant="micro" tone="muted" overline>
                  Tahmini varış
                </Typography>
                <Typography variant="bodyStrong" tabular>
                  {formatDuration(task.estimatedDurationMinutes)}
                </Typography>
              </View>
            </View>
          </Surface>
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}

/* ── Verification ───────────────────────────────────────────────────────── */

export type VerificationMethod = 'code' | 'qr' | 'photo' | 'signature';

export interface DeliveryVerificationScreenProps {
  task: Delivery;
  method?: VerificationMethod;
  /** Wrong code entered. */
  errorText?: string;
  submitting?: boolean;
  onBack?: () => void;
  onConfirm?: () => void;
  onFail?: () => void;
}

/**
 * Handover verification.
 *
 * Four methods because doorstep reality varies: the code is the default, QR is
 * faster for business drop-offs, and photo/signature are the fallbacks when
 * the recipient cannot produce a code. Failing the delivery is always one tap
 * away — burying it causes couriers to force a false success.
 */
export function DeliveryVerificationScreen({
  task,
  method: initialMethod = 'code',
  errorText,
  submitting = false,
  onBack,
  onConfirm,
  onFail,
}: DeliveryVerificationScreenProps) {
  const theme = useTheme();
  const [method, setMethod] = useState<VerificationMethod>(initialMethod);
  const [code, setCode] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo' | 'qr' | null>(null);
  const [signerName, setSignerName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Teslimat doğrulama"
          subtitle={task.trackingNumber}
          onBack={onBack}
          bordered
        />
      }
      tone="sunken"
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label="Teslimatı tamamla"
            size="lg"
            icon={PackageCheck}
            onPress={onConfirm}
            loading={submitting}
            disabled={
              (method === 'code' && code.length < (task.deliveryCode?.length ?? 4)) ||
              (method === 'signature' && (!hasSignature || signerName.trim().length === 0))
            }
          />
          <Button label="Teslim edilemedi" variant="tertiary" onPress={onFail} />
        </View>
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <SegmentedControl
            value={method}
            onChange={setMethod}
            accentColor={theme.colors.role.courier}
            options={[
              { value: 'code', label: 'Kod' },
              { value: 'qr', label: 'QR' },
              { value: 'photo', label: 'Fotoğraf' },
              { value: 'signature', label: 'İmza' },
            ]}
          />

          {method === 'code' && (
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">Alıcıdan kodu iste</Typography>
              <Typography variant="bodySm" tone="secondary">
                Alıcının telefonuna gönderilen {task.deliveryCode?.length ?? 4} haneli kodu gir.
              </Typography>
              <OtpInput
                value={code}
                onChangeText={setCode}
                length={(task.deliveryCode?.length ?? 4) === 6 ? 6 : 4}
                errorText={errorText}
                autoFocus
              />
            </Surface>
          )}

          {method === 'qr' && (
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">QR kodu okut</Typography>
              {scannedCode ? (
                <InlineAlert
                  tone="success"
                  icon={CheckCircle2}
                  message={`QR okundu: ${scannedCode}. Teslimatı tamamlayabilirsin.`}
                />
              ) : (
                <Touchable
                  onPress={() => setCameraMode('qr')}
                  feedback="card"
                  accessibilityLabel="QR okuyucuyu aç"
                >
                  <View
                    style={{
                      height: 200,
                      borderRadius: theme.radius.md,
                      backgroundColor: theme.colors.background.secondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: theme.spacing.sm,
                    }}
                  >
                    <Icon icon={QrCode} size={64} tone="muted" strokeWidth={1.25} />
                    <Typography variant="micro" tone="muted">
                      Okuyucuyu açmak için dokun
                    </Typography>
                  </View>
                </Touchable>
              )}
            </Surface>
          )}

          {method === 'photo' && (
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">Teslimat fotoğrafı</Typography>
              <Typography variant="bodySm" tone="secondary">
                Paketi bırakırken kapı önünü fotoğrafla. Fotoğraf müşteriyle paylaşılır.
              </Typography>
              {photoUri ? (
                <>
                  <Image
                    source={{ uri: photoUri }}
                    style={{ height: 200, borderRadius: theme.radius.md }}
                    resizeMode="cover"
                  />
                  <Touchable
                    onPress={() => setCameraMode('photo')}
                    feedback="opacity"
                    accessibilityLabel="Yeniden çek"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Typography variant="caption" tone="accent" weight="semibold">
                      Yeniden çek
                    </Typography>
                  </Touchable>
                </>
              ) : (
                <Touchable
                  onPress={() => setCameraMode('photo')}
                  feedback="card"
                  accessibilityLabel="Fotoğraf çek"
                >
                  <View
                    style={{
                      height: 160,
                      borderRadius: theme.radius.md,
                      borderWidth: theme.borderWidth.thick,
                      borderStyle: 'dashed',
                      borderColor: theme.colors.border.strong,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: theme.spacing.xs,
                    }}
                  >
                    <Icon icon={Camera} size="xl" tone="muted" />
                    <Typography variant="caption" tone="secondary">
                      Fotoğraf çek
                    </Typography>
                  </View>
                </Touchable>
              )}
            </Surface>
          )}

          {method === 'signature' && (
            <Surface tone="elevated" radius="lg" padding="lg" bordered style={{ gap: theme.spacing.md }}>
              <Typography variant="h3">Alıcı imzası</Typography>
              <SignaturePad height={180} onChange={setHasSignature} />
              <TextField
                label="Alıcı adı"
                placeholder="Teslim alan kişinin adı"
                value={signerName}
                onChangeText={setSignerName}
              />
            </Surface>
          )}
        </View>
      </ScrollContainer>

      <CameraCaptureModal
        visible={cameraMode !== null}
        mode={cameraMode ?? 'photo'}
        onClose={() => setCameraMode(null)}
        onCapture={(uri) => setPhotoUri(uri)}
        onScan={(data) => setScannedCode(data)}
      />
    </ScreenScaffold>
  );
}

/* ── Failure flow ───────────────────────────────────────────────────────── */

export interface DeliveryFailureScreenProps {
  task: Delivery;
  reason?: FailureReason;
  submitting?: boolean;
  onBack?: () => void;
  onSubmit?: (reason: FailureReason, note: string) => void;
}

export function DeliveryFailureScreen({
  task,
  reason: initialReason,
  submitting = false,
  onBack,
  onSubmit,
}: DeliveryFailureScreenProps) {
  const theme = useTheme();
  const [reason, setReason] = useState<FailureReason | undefined>(initialReason);
  const [note, setNote] = useState('');
  const noteRequired = reason === 'other';

  return (
    <ScreenScaffold
      header={
        <AppHeader
          title="Teslim edilemedi"
          subtitle={task.trackingNumber}
          onBack={onBack}
          bordered
        />
      }
      tone="sunken"
      footer={
        <Button
          label="Bildir ve görevi kapat"
          variant="danger"
          onPress={() => reason && onSubmit?.(reason, note)}
          disabled={!reason || (noteRequired && note.trim().length === 0)}
          loading={submitting}
        />
      }
    >
      <ScrollContainer keyboardAware>
        <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.md }}>
          <InlineAlert
            tone="warning"
            message="Bildirimin müşteriye ve operasyona anında iletilir. Paket depoya geri döner."
          />

          <View style={{ gap: theme.spacing.sm }} accessibilityRole="radiogroup">
            {FAILURE_REASONS.map((r) => (
              <Touchable
                key={r.id}
                onPress={() => setReason(r.id)}
                feedback="card"
                accessibilityRole="radio"
                accessibilityState={{ selected: reason === r.id }}
                accessibilityLabel={r.label}
              >
                <Surface
                  tone="elevated"
                  radius="lg"
                  padding="lg"
                  bordered
                  borderColor={reason === r.id ? theme.colors.feedback.error : undefined}
                  style={{ gap: 2 }}
                >
                  <Typography
                    variant="bodyStrong"
                    tone={reason === r.id ? 'danger' : 'primary'}
                  >
                    {r.label}
                  </Typography>
                  <Typography variant="micro" tone="muted">
                    {r.hint}
                  </Typography>
                </Surface>
              </Touchable>
            ))}
          </View>

          <TextField
            label={noteRequired ? 'Açıklama' : 'Açıklama (isteğe bağlı)'}
            placeholder="Ne olduğunu kısaca anlat"
            value={note}
            onChangeText={setNote}
            multiline
            rows={3}
            required={noteRequired}
            maxLength={300}
            showCounter
          />
        </View>
      </ScrollContainer>
    </ScreenScaffold>
  );
}
