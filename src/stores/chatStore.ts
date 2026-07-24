import { create } from 'zustand';
import { chatService } from '../services/chatService';
import type { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error?: string;

  fetchMessages: (deliveryId: string) => Promise<void>;
  send: (deliveryId: string, text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  sending: false,
  error: undefined,

  fetchMessages: async (deliveryId) => {
    set({ loading: true, error: undefined });
    try {
      set({ messages: await chatService.getMessages(deliveryId), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Mesajlar yüklenemedi' });
    }
  },

  send: async (deliveryId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    set({ sending: true, error: undefined });
    try {
      const message = await chatService.sendMessage(deliveryId, trimmed);
      set((s) => ({ sending: false, messages: [...s.messages, message] }));
    } catch (e) {
      set({ sending: false, error: e instanceof Error ? e.message : 'Mesaj gönderilemedi' });
    }
  },
}));
