import type { FaqItem } from '../types';

/** Sık sorulan sorular — Yardım ve destek ekranı (Faz 5'te sunucudan gelecek). */
export const faqItems: FaqItem[] = [
  {
    id: 'faq-tracking',
    question: 'Teslimatımı nasıl takip ederim?',
    answer:
      'Ana sayfadaki aktif teslimat kartına dokun. Kuryenin konumunu haritada canlı görebilir, tahmini varış süresini takip edebilirsin.',
  },
  {
    id: 'faq-payment',
    question: 'Ödeme nasıl alınır?',
    answer:
      'Ücret, teslimatı onayladığında kayıtlı kartından tahsil edilir. Gerçek mesafeye göre teslimat sonunda küçük bir güncelleme olabilir.',
  },
  {
    id: 'faq-cancel',
    question: 'Teslimatı iptal edebilir miyim?',
    answer:
      'Kurye paketi almadan önce teslimatı ücretsiz iptal edebilirsin. Kurye yola çıktıysa iptal koşulları için destek ekibine yaz.',
  },
  {
    id: 'faq-address',
    question: 'Kayıtlı adreslerimi nasıl yönetirim?',
    answer:
      'Profil > Adreslerim bölümünden yeni adres ekleyebilir, mevcut adresleri düzenleyebilir veya silebilirsin.',
  },
  {
    id: 'faq-courier',
    question: 'Kurye gelmezse ne olur?',
    answer:
      'Kurye makul sürede ulaşmazsa teslimat otomatik olarak yeniden atanır. Dilersen destek ekibinden anlık yardım alabilirsin.',
  },
];
