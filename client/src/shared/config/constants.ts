/**
 * Application-wide constants
 */

export const APP_NAME = 'GREEN-API Chat';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  RECEIVED: 'received',
  FAILED: 'failed',
} as const;

export const MESSAGE_DIRECTION = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
} as const;

export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
} as const;

export const ACTIVITY_EVENT_TYPE = {
  MESSAGE_CREATED: 'message.created',
  MESSAGE_SENDING: 'message.sending',
  MESSAGE_SENT: 'message.sent',
  MESSAGE_FAILED: 'message.failed',
  NOTIFICATION_RECEIVED: 'notification.received',
  NOTIFICATION_PROCESSED: 'notification.processed',
  NOTIFICATION_DELETED: 'notification.deleted',
  CONNECTION_CONNECTED: 'connection.connected',
  CONNECTION_DISCONNECTED: 'connection.disconnected',
} as const;

export const ROUTES = {
  HOME: '/',
  CONNECT: '/connect',
  CHAT: '/chat',
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_DEVELOPER_MODE: 'Ctrl+Shift+D',
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
} as const;

export const POLLING_INTERVAL = 5000; // 5 seconds for GREEN-API notification polling

export const MAX_MESSAGE_LENGTH = 4096; // WhatsApp message limit

export const AUTO_SCROLL_THRESHOLD = 100; // px from bottom to trigger auto-scroll

export const RECONNECT_DELAY = 5000; // 5 seconds

export const MAX_RETRY_ATTEMPTS = 3;

export const RETRY_DELAY = 2000; // 2 seconds

export const SESSION_STORAGE_KEYS = {
  CREDENTIALS: 'green-api-credentials',
  ACTIVE_CHAT: 'active-chat-id',
} as const;
