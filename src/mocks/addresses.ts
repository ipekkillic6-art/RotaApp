import type { Address } from '../types';

/**
 * Istanbul addresses with real district names and realistic lengths —
 * including one deliberately long address, because "Mahallesi … Sokak No:12/4
 * Daire:7" is what the component will actually be handed.
 */

export const addresses = {
  officeLevent: {
    id: 'adr-01',
    title: 'Ofis',
    fullAddress: 'Büyükdere Cad. No:127 Astoria Kule A, Kat 12',
    city: 'İstanbul',
    district: 'Şişli',
    latitude: 41.0766,
    longitude: 29.0116,
    contactName: 'İpek Kılıç',
    contactPhone: '+90 532 114 22 07',
    note: 'Resepsiyona bırakabilirsiniz.',
  },
  homeKadikoy: {
    id: 'adr-02',
    title: 'Ev',
    fullAddress: 'Caferağa Mah. General Asım Gündüz Cad. No:44 D:9',
    city: 'İstanbul',
    district: 'Kadıköy',
    latitude: 40.9902,
    longitude: 29.0264,
    contactName: 'Elif Şahin',
    contactPhone: '+90 545 208 91 33',
    note: '3. kat, zil çalışmıyor — arayın.',
  },
  storeNisantasi: {
    id: 'adr-03',
    title: 'Mağaza',
    fullAddress: 'Teşvikiye Mah. Abdi İpekçi Cad. No:18/A',
    city: 'İstanbul',
    district: 'Şişli',
    latitude: 41.0489,
    longitude: 28.9936,
    contactName: 'Mert Çelik',
    contactPhone: '+90 533 907 44 18',
  },
  warehouseTuzla: {
    id: 'adr-04',
    title: 'Depo',
    fullAddress: 'Orhanlı Mah. Gebze Yolu Cad. Trakya Lojistik Merkezi B Blok No:214',
    city: 'İstanbul',
    district: 'Tuzla',
    latitude: 40.8358,
    longitude: 29.3021,
    contactName: 'Operasyon',
    contactPhone: '+90 216 494 00 12',
  },
  /** Edge case: an address long enough to wrap on a 320px screen. */
  longAddress: {
    id: 'adr-05',
    title: 'Şantiye şefliği geçici ofis binası',
    fullAddress:
      'Yeni Mahalle Fatih Sultan Mehmet Bulvarı Ihlamurdere Sokak Beyaz Konaklar Sitesi C-3 Blok Kat 4 Daire 17 (eski PTT binası karşısı)',
    city: 'İstanbul',
    district: 'Başakşehir',
    latitude: 41.0937,
    longitude: 28.8028,
    contactName: 'Abdurrahman Karaağaçlıoğlu',
    contactPhone: '+90 505 771 63 90',
    note: 'Şantiye girişinde kimlik bırakmanız gerekiyor, kask zorunlu.',
  },
} satisfies Record<string, Address>;

export const savedAddresses: Address[] = [
  addresses.homeKadikoy,
  addresses.officeLevent,
  addresses.storeNisantasi,
];

export const recentAddresses: Address[] = [
  addresses.storeNisantasi,
  addresses.homeKadikoy,
  addresses.warehouseTuzla,
];

/** Search suggestions for the address picker. */
export const addressSuggestions: Address[] = [
  ...savedAddresses,
  addresses.warehouseTuzla,
  addresses.longAddress,
];
