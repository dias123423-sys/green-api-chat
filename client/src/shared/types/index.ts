/**
 * Domain types
 * These are NOT GREEN-API DTOs — they are our application's domain models
 */

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'sending' | 'sent' | 'received' | 'failed';

export interface Message {
  id: string;
  clientId: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  createdAt: string;
  error?: string;
}

export interface Chat {
  id: string;
  phoneNumber: string;
  displayName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  error?: string;
  lastConnected?: string;
}

export type ActivityEventType =
  | 'message.created'
  | 'message.sending'
  | 'message.sent'
  | 'message.failed'
  | 'notification.received'
  | 'notification.processed'
  | 'notification.deleted'
  | 'connection.connected'
  | 'connection.disconnected';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  messageId?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export type ErrorType = 'validation' | 'network' | 'api' | 'auth' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  technicalDetails?: unknown;
}
