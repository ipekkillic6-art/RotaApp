import { api } from '../utils/api';
import { chatMessages } from '../mocks/chat';
import type { ChatMessage } from '../types';

// Oturum boyunca mesajları tutan bellek içi kopya (deliveryId'e göre).
const threads: Record<string, ChatMessage[]> = {};

const threadFor = (deliveryId: string): ChatMessage[] => {
  if (!threads[deliveryId]) threads[deliveryId] = chatMessages.map((m) => ({ ...m }));
  return threads[deliveryId];
};

export const chatService = {
  getMessages: (deliveryId: string, signal?: AbortSignal) =>
    api.get<ChatMessage[]>(`/deliveries/${deliveryId}/messages`, {
      signal,
      mock: () => threadFor(deliveryId),
    }),

  sendMessage: (deliveryId: string, text: string, signal?: AbortSignal) =>
    api.post<ChatMessage>(`/deliveries/${deliveryId}/messages`, {
      body: { text },
      signal,
      mock: () => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text,
          at: new Date().toISOString(),
        };
        threadFor(deliveryId).push(message);
        return message;
      },
    }),
};
