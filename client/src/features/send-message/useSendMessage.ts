/**
 * Send message hook with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useMessageStore } from '@/entities/message/hooks';
import { useChatStore } from '@/entities/chat/hooks';
import { generateTempId, generateClientId } from '@/shared/lib/utils';
import type { Message } from '@/shared/types';

interface SendMessageParams {
  chatId: string;
  text: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const replaceMessage = useMessageStore((state) => state.replaceMessage);
  const updateChat = useChatStore((state) => state.updateChat);

  return useMutation({
    mutationFn: async ({ chatId, text }: SendMessageParams) => {
      return apiClient.sendMessage(chatId, text);
    },

    onMutate: async ({ chatId, text }) => {
      // Create optimistic message
      const tempId = generateTempId();
      const optimisticMessage: Message = {
        id: tempId,
        clientId: generateClientId(),
        chatId,
        text,
        direction: 'outgoing',
        status: 'sending',
        createdAt: new Date().toISOString(),
      };

      // Add optimistic message immediately
      addMessage(chatId, optimisticMessage);

      // Update chat's last message
      updateChat(chatId, {
        lastMessage: text,
        lastMessageTime: optimisticMessage.createdAt,
      });

      // Return context for rollback
      return { tempId, optimisticMessage };
    },

    onSuccess: (response, { chatId }, context) => {
      if (!context) return;

      // Replace optimistic message with real one
      const confirmedMessage: Message = {
        ...context.optimisticMessage,
        id: response.idMessage,
        status: 'sent',
      };

      replaceMessage(chatId, context.tempId, confirmedMessage);

      // Invalidate queries if needed
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    },

    onError: (error, { chatId }, context) => {
      if (!context) return;

      console.error('Failed to send message:', error);

      // Mark message as failed
      updateMessage(chatId, context.tempId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to send',
      });
    },
  });
}
