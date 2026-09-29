/**
 * SSE message stream hook
 * Subscribes to real-time incoming messages
 */

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { useMessageStore } from '@/entities/message/hooks';
import { useChatStore } from '@/entities/chat/hooks';
import { useAppStore } from '@/shared/api/store';
import type { Message } from '@/shared/types';

interface SSEMessage {
  type: 'connected' | 'message';
  data?: Message;
}

export function useMessageStream() {
  const sessionId = useAppStore((state) => state.sessionId);
  const connectionStatus = useAppStore((state) => state.connectionStatus);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      console.log('No session ID, skipping SSE connection');
      return;
    }

    console.log('Connecting to SSE stream...');
    setError(null);

    try {
      // Subscribe to SSE events
      const unsubscribe = apiClient.subscribeToEvents(
        (event: unknown) => {
          const sseMessage = event as SSEMessage;

          if (sseMessage.type === 'connected') {
            console.log('SSE connected');
            useAppStore.getState().setConnectionStatus('connected');
            setError(null);
            return;
          }

          if (sseMessage.type === 'message' && sseMessage.data) {
            const message = sseMessage.data;
            console.log('Received message:', message);

            // Add message to store
            useMessageStore.getState().addMessage(message.chatId, message);

            // Update or create chat
            const existingChat = useChatStore.getState().getChat(message.chatId);
            
            if (existingChat) {
              // Update existing chat
              useChatStore.getState().updateChat(message.chatId, {
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
              });
            } else {
              // Create new chat from incoming message
              const phoneNumber = message.chatId.replace('@c.us', '');
              useChatStore.getState().addChat({
                id: message.chatId,
                phoneNumber,
                displayName: phoneNumber,
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
              });
            }
          }
        },
        (err) => {
          console.error('SSE error:', err);
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          useAppStore.getState().setConnectionStatus('error');
        }
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        console.log('Disconnecting from SSE stream');
        unsubscribe();
      };
    } catch (err) {
      console.error('Failed to subscribe to SSE:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      useAppStore.getState().setConnectionStatus('error');
    }
  }, [sessionId]); // Убрали все функции из зависимостей

  return {
    isConnected: connectionStatus === 'connected',
    error,
  };
}
