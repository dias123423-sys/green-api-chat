/**
 * Message entity hooks
 */

import { create } from 'zustand';
import type { Message } from '@/shared/types';

interface MessageStore {
  messages: Record<string, Message[]>; // chatId -> messages[]
  
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  replaceMessage: (chatId: string, oldId: string, newMessage: Message) => void;
  getMessages: (chatId: string) => Message[];
  clearMessages: (chatId: string) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},

  addMessage: (chatId, message) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      
      // Check for duplicates by id or clientId
      const exists = chatMessages.some(
        (m) => m.id === message.id || m.clientId === message.clientId
      );
      
      if (exists) return state;

      return {
        messages: {
          ...state.messages,
          [chatId]: [...chatMessages, message],
        },
      };
    }),

  updateMessage: (chatId, messageId, updates) =>
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages) return state;

      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((msg) =>
            msg.id === messageId || msg.clientId === messageId
              ? { ...msg, ...updates }
              : msg
          ),
        },
      };
    }),

  replaceMessage: (chatId, oldId, newMessage) =>
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages) return state;

      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((msg) =>
            msg.id === oldId || msg.clientId === oldId ? newMessage : msg
          ),
        },
      };
    }),

  getMessages: (chatId) => get().messages[chatId] || [],

  clearMessages: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.messages;
      return { messages: rest };
    }),
}));
