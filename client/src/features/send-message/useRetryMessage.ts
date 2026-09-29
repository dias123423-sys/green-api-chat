/**
 * Retry failed message hook
 */

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useMessageStore } from '@/entities/message/hooks';
import type { Message } from '@/shared/types';

interface RetryMessageParams {
  chatId: string;
  message: Message;
}

export function useRetryMessage() {
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const replaceMessage = useMessageStore((state) => state.replaceMessage);

  return useMutation({
    mutationFn: async ({ chatId, message }: RetryMessageParams) => {
      // Set status to sending
      updateMessage(chatId, message.id, { status: 'sending', error: undefined });

      // Retry sending
      return apiClient.sendMessage(chatId, message.text);
    },

    onSuccess: (response, { chatId, message }) => {
      // Replace with confirmed message
      const confirmedMessage: Message = {
        ...message,
        id: response.idMessage,
        status: 'sent',
        error: undefined,
      };

      replaceMessage(chatId, message.id, confirmedMessage);
    },

    onError: (error, { chatId, message }) => {
      console.error('Retry failed:', error);

      // Mark as failed again
      updateMessage(chatId, message.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Retry failed',
      });
    },
  });
}
