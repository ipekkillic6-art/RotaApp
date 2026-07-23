import {
  BellOff,
  Camera,
  CloudOff,
  History,
  Inbox,
  MapPinOff,
  PackageSearch,
  SearchX,
  ServerCrash,
  TriangleAlert,
  Truck,
} from 'lucide-react-native';
import type { StateViewProps } from './StateView';

type Preset = Pick<StateViewProps, 'icon' | 'title' | 'description' | 'tone'>;

/**
 * Every empty/error state the product can reach, written once.
 *
 * Copy is part of the design system here, not the screen: "no deliveries"
 * phrased three different ways across three screens is the most common way a
 * product starts feeling unfinished. Each description says what happened and
 * what to do next.
 */
export const STATE_PRESETS = {
  noDeliveries: {
    icon: PackageSearch,
    title: 'Henüz teslimatın yok',
    description: 'İlk teslimatını oluştur, kuryemiz 10 dakika içinde kapında olsun.',
    tone: 'brand',
  },
  noActiveTasks: {
    icon: Truck,
    title: 'Aktif görevin yok',
    description: 'Çevrimiçi kaldığın sürece yeni görevler burada belirir.',
    tone: 'neutral',
  },
  noSearchResults: {
    icon: SearchX,
    title: 'Sonuç bulunamadı',
    description: 'Farklı bir takip numarası, adres veya kurye adı deneyin.',
    tone: 'neutral',
  },
  noNotifications: {
    icon: BellOff,
    title: 'Bildirim yok',
    description: 'Teslimatlarınla ilgili gelişmeler burada görünecek.',
    tone: 'neutral',
  },
  noHistory: {
    icon: History,
    title: 'Geçmiş boş',
    description: 'Tamamlanan teslimatların burada listelenir.',
    tone: 'neutral',
  },
  noFilterResults: {
    icon: Inbox,
    title: 'Bu filtreye uyan teslimat yok',
    description: 'Filtreleri temizleyip tekrar deneyin.',
    tone: 'neutral',
  },
  locationPermission: {
    icon: MapPinOff,
    title: 'Konum izni gerekiyor',
    description:
      'Kuryeyi haritada takip edebilmen ve doğru adres önerileri alabilmen için konum iznine ihtiyacımız var.',
    tone: 'warning',
  },
  cameraPermission: {
    icon: Camera,
    title: 'Kamera izni gerekiyor',
    description:
      'Teslimat fotoğrafı ve QR kod okutma için kamera erişimine izin vermelisin.',
    tone: 'warning',
  },
  networkError: {
    icon: CloudOff,
    title: 'Bağlantı kurulamadı',
    description: 'İnternet bağlantını kontrol edip tekrar dene.',
    tone: 'error',
  },
  serverError: {
    icon: ServerCrash,
    title: 'Bir şeyler ters gitti',
    description: 'Sunucuya ulaşamadık. Birkaç saniye sonra tekrar dene.',
    tone: 'error',
  },
  genericError: {
    icon: TriangleAlert,
    title: 'Beklenmeyen bir hata oluştu',
    description: 'İşlemi tamamlayamadık. Sorun sürerse destek ekibiyle iletişime geç.',
    tone: 'error',
  },
} satisfies Record<string, Preset>;

export type StatePresetKey = keyof typeof STATE_PRESETS;
