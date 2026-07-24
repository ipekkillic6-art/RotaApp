/**
 * Domain models.
 *
 * These are deliberately plain and API-shaped: when a real backend arrives,
 * this file is the contract to negotiate against, and nothing in the UI layer
 * has to change as long as these shapes hold.
 */

export type UserRole = 'customer' | 'courier' | 'admin';

export type DeliveryStatus =
  | 'pending'
  | 'assigning'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type VehicleType = 'motorcycle' | 'car' | 'bicycle' | 'walking';

export type CourierStatus = 'available' | 'busy' | 'offline' | 'suspended';

export type PackageTypeId =
  | 'document'
  | 'small'
  | 'medium'
  | 'large'
  | 'fragile'
  | 'food'
  | 'special';

export type FailureReason =
  | 'recipient_absent'
  | 'phone_unreachable'
  | 'wrong_address'
  | 'package_refused'
  | 'security_issue'
  | 'other';

export interface Address {
  id: string;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  /** Free-text note for the courier ("2. kat, zil çalışmıyor"). */
  note?: string;
}

export interface Courier {
  id: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  vehicleType: VehicleType;
  status: CourierStatus;
  completedDeliveries: number;
  /** Deliveries completed today — drives the courier home screen. */
  todayDeliveries?: number;
  activeTaskCount: number;
  phone?: string;
  /** Distance from the pickup point, in km. Assignment screens only. */
  distanceKm?: number;
  /** Minutes until the courier reaches the next waypoint. */
  etaMinutes?: number;
}

export interface PriceBreakdown {
  base: number;
  distance: number;
  /** Extra services: insurance, handling, out-of-hours. */
  extras: number;
  discount: number;
  total: number;
  currency: 'TRY';
}

export interface StatusEvent {
  status: DeliveryStatus;
  /** ISO timestamp. */
  at: string;
  note?: string;
  /** Who or what moved the delivery into this state. */
  actor?: string;
}

export interface Delivery {
  id: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  courierId?: string;
  courier?: Courier;
  pickupAddress: Address;
  dropoffAddress: Address;
  packageType: PackageTypeId;
  packageDescription?: string;
  status: DeliveryStatus;
  /** Absent for drafts and for quotes that failed to price. */
  price?: PriceBreakdown;
  distanceKm: number;
  estimatedDurationMinutes: number;
  deliveryCode?: string;
  createdAt: string;
  scheduledAt?: string;
  deliveredAt?: string;
  failureReason?: FailureReason;
  failureNote?: string;
  /** True when the promised window has been missed. */
  isDelayed?: boolean;
  history?: StatusEvent[];
  rating?: number;
}

export type NotificationKind =
  | 'courier_assigned'
  | 'package_picked_up'
  | 'courier_on_the_way'
  | 'courier_nearby'
  | 'delivery_completed'
  | 'delivery_failed'
  | 'new_task'
  | 'task_cancelled'
  | 'payment_completed'
  | 'ops_alert';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Critical notifications survive "mark all read" and sort to the top. */
  critical?: boolean;
  deliveryId?: string;
}

export interface EarningsPeriod {
  label: string;
  amount: number;
  deliveries: number;
  bonus: number;
  /** Average earned per delivery, in TRY. */
  averagePerDelivery: number;
}

export interface CourierPerformance {
  rating: number;
  completionRate: number;
  averageDeliveryMinutes: number;
  cancellationRate: number;
  onTimeRate: number;
}

export interface OpsMetrics {
  activeDeliveries: number;
  pendingDeliveries: number;
  availableCouriers: number;
  delayedDeliveries: number;
  failedDeliveries: number;
  totalToday: number;
  successRate: number;
  averageDeliveryMinutes: number;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: string;
}

/** Gizlilik ve güvenlik tercihleri — Profil > Gizlilik ve güvenlik. */
export interface PrivacySettings {
  /** Uygulama açılışında biyometrik (Face ID / parmak izi) doğrulama. */
  biometricLogin: boolean;
  /** Girişte SMS ile ek kod. */
  twoFactor: boolean;
  /** Teslimat sırasında konumu kuryeyle paylaş. */
  locationSharing: boolean;
  /** Uygulamayı iyileştirmek için anonim kullanım analizi. */
  usageAnalytics: boolean;
  /** İlgi alanına göre kampanya ve öneriler. */
  personalizedOffers: boolean;
}

export type PrivacySettingKey = keyof PrivacySettings;

/** Sık sorulan soru — Yardım ve destek ekranı. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type ChatSender = 'customer' | 'courier';

/** Müşteri ↔ kurye mesajı (teslimat takibi sohbeti). */
export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  /** ISO timestamp. */
  at: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown';

/** Kayıtlı ödeme kartı. Güvenlik için yalnızca son 4 hane + marka saklanır. */
export interface PaymentCard {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}
