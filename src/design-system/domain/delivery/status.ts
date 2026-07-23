import {
  AlertTriangle,
  Ban,
  Bike,
  Boxes,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Footprints,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  PackageOpen,
  Radar,
  ShieldCheck,
  UserCheck,
  UtensilsCrossed,
  Wine,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import type { Theme } from '../../themes';
import type { DeliveryStatus, FailureReason, PackageTypeId, VehicleType } from '../../../types';

/**
 * Presentation metadata for delivery status.
 *
 * The rule this file enforces: a status is never communicated by colour
 * alone. Every status carries an icon and a Turkish label, and the colour is
 * only the third signal. That is why `StatusBadge` always renders all three.
 *
 * `step` is the position in the happy path (0-5) and is what the stepper
 * reads; terminal failures return -1 because they leave the path.
 */
export interface StatusMeta {
  label: string;
  /** One-line explanation used in timelines and sheets. */
  description: string;
  icon: LucideIcon;
  /** Index in the happy path, or -1 for states that leave it. */
  step: number;
  /** Which end-state family this belongs to. */
  kind: 'waiting' | 'progress' | 'success' | 'failure';
}

export const STATUS_META: Record<DeliveryStatus, StatusMeta> = {
  pending: {
    label: 'Bekliyor',
    description: 'Teslimat oluşturuldu, kurye ataması bekleniyor.',
    icon: Clock,
    step: 0,
    kind: 'waiting',
  },
  assigning: {
    label: 'Kurye aranıyor',
    description: 'Bölgedeki uygun kuryelere görev gönderiliyor.',
    icon: Radar,
    step: 1,
    kind: 'waiting',
  },
  assigned: {
    label: 'Kurye atandı',
    description: 'Görev bir kuryeye atandı, onayı bekleniyor.',
    icon: UserCheck,
    step: 2,
    kind: 'progress',
  },
  accepted: {
    label: 'Kurye kabul etti',
    description: 'Kurye görevi kabul etti ve alış noktasına yöneliyor.',
    icon: CheckCircle2,
    step: 3,
    kind: 'progress',
  },
  picked_up: {
    label: 'Paket alındı',
    description: 'Paket gönderiden teslim alındı.',
    icon: PackageCheck,
    step: 4,
    kind: 'progress',
  },
  on_the_way: {
    label: 'Yolda',
    description: 'Kurye teslimat adresine doğru yolda.',
    icon: Navigation,
    step: 5,
    kind: 'progress',
  },
  delivered: {
    label: 'Teslim edildi',
    description: 'Paket alıcıya teslim edildi.',
    icon: MapPin,
    step: 6,
    kind: 'success',
  },
  failed: {
    label: 'Teslim edilemedi',
    description: 'Teslimat tamamlanamadı.',
    icon: XCircle,
    step: -1,
    kind: 'failure',
  },
  cancelled: {
    label: 'İptal edildi',
    description: 'Teslimat iptal edildi.',
    icon: Ban,
    step: -1,
    kind: 'failure',
  },
};

/** The happy path, in order — what the stepper walks. */
export const HAPPY_PATH: DeliveryStatus[] = [
  'pending',
  'assigning',
  'assigned',
  'accepted',
  'picked_up',
  'on_the_way',
  'delivered',
];

export interface StatusPalette {
  /** Foreground: icon + label. */
  color: string;
  /** Tinted fill behind the badge. */
  surface: string;
}

const STATUS_KEY: Record<DeliveryStatus, keyof Theme['colors']['status']> = {
  pending: 'pending',
  assigning: 'assigning',
  assigned: 'assigned',
  accepted: 'accepted',
  picked_up: 'pickedUp',
  on_the_way: 'onTheWay',
  delivered: 'delivered',
  failed: 'failed',
  cancelled: 'cancelled',
};

export function statusPalette(theme: Theme, status: DeliveryStatus): StatusPalette {
  const key = STATUS_KEY[status];
  return { color: theme.colors.status[key], surface: theme.colors.statusSurface[key] };
}

/** Overlay signal for a delivery that has blown its window. */
export const DELAYED_META = {
  label: 'Gecikti',
  icon: AlertTriangle,
} as const;

/* ── Package types ──────────────────────────────────────────────────────── */

export interface PackageTypeMeta {
  id: PackageTypeId;
  label: string;
  /** Shown under the label in the selector. */
  hint: string;
  icon: LucideIcon;
}

export const PACKAGE_TYPES: PackageTypeMeta[] = [
  { id: 'document', label: 'Evrak', hint: 'Zarf, belge · 0-1 kg', icon: FileText },
  { id: 'small', label: 'Küçük paket', hint: '30×30 cm’e kadar · 0-3 kg', icon: Package },
  { id: 'medium', label: 'Orta paket', hint: '50×50 cm’e kadar · 3-10 kg', icon: PackageOpen },
  { id: 'large', label: 'Büyük paket', hint: '10-25 kg · araç gerekir', icon: Boxes },
  { id: 'fragile', label: 'Kırılabilir', hint: 'Özel paketleme · dikkatli taşıma', icon: Wine },
  { id: 'food', label: 'Yemek', hint: 'Sıcak/soğuk zincir · öncelikli', icon: UtensilsCrossed },
  { id: 'special', label: 'Özel teslimat', hint: 'Değerli kargo · imza zorunlu', icon: ShieldCheck },
];

export const packageTypeMeta = (id: PackageTypeId): PackageTypeMeta =>
  PACKAGE_TYPES.find((p) => p.id === id) ?? PACKAGE_TYPES[1];

/* ── Vehicles ───────────────────────────────────────────────────────────── */

export const VEHICLE_META: Record<VehicleType, { label: string; icon: LucideIcon }> = {
  motorcycle: { label: 'Motosiklet', icon: Bike },
  car: { label: 'Otomobil', icon: Car },
  bicycle: { label: 'Bisiklet', icon: Bike },
  walking: { label: 'Yaya', icon: Footprints },
};

/* ── Failure reasons ────────────────────────────────────────────────────── */

export const FAILURE_REASONS: Array<{ id: FailureReason; label: string; hint: string }> = [
  { id: 'recipient_absent', label: 'Alıcı adreste değil', hint: 'Kapı çalındı, yanıt yok' },
  { id: 'phone_unreachable', label: 'Telefon kapalı', hint: 'Alıcıya ulaşılamıyor' },
  { id: 'wrong_address', label: 'Adres hatalı', hint: 'Adres bulunamadı veya yanlış' },
  { id: 'package_refused', label: 'Paket reddedildi', hint: 'Alıcı teslim almak istemedi' },
  { id: 'security_issue', label: 'Güvenlik sorunu', hint: 'Bölgeye giriş güvenli değil' },
  { id: 'other', label: 'Diğer', hint: 'Açıklama girmen gerekir' },
];
