/**
 * Chat entity hooks
 */

import { create } from 'zustand';
import type { Chat } from '@/shared/types';

interface ChatStore {
  chats: Chat[];
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  getChat: (chatId: string) => Chat | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],

  addChat: (chat) =>
    set((state) => {
      // Check if chat already exists
      const exists = state.chats.some((c) => c.id === chat.id);
      if (exists) return state;

      return { chats: [chat, ...state.chats] };
    }),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),

  getChat: (chatId) => get().chats.find((c) => c.id === chatId),
}));
