import type { ChatMessage } from '../types';

/** Tohum sohbet — teslimat takibinde müşteri ile kurye arasında. */
export const chatMessages: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'courier',
    text: 'Merhaba, paketinizi aldım, yola çıkıyorum.',
    at: '2026-07-24T11:40:00Z',
  },
  {
    id: 'msg-02',
    sender: 'customer',
    text: 'Teşekkürler! Geldiğinizde arayabilir misiniz?',
    at: '2026-07-24T11:41:00Z',
  },
  {
    id: 'msg-03',
    sender: 'courier',
    text: 'Tabii, kapıya geldiğimde sizi ararım.',
    at: '2026-07-24T11:41:30Z',
  },
];

/** Tek dokunuşla gönderilebilen hazır mesajlar. */
export const quickReplies: string[] = [
  'Kapıdayım',
  'Zile basmayın, lütfen arayın',
  'Biraz bekler misiniz?',
  'Kapıya bırakabilirsiniz',
];
