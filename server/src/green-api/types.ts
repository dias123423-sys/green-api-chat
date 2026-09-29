/**
 * GREEN-API Response Types
 * Based on official documentation: https://green-api.com/v3/docs/
 */

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

// SendMessage Response
export interface SendMessageResponse {
  idMessage: string;
}

// ReceiveNotification Response
export interface NotificationBody {
  typeWebhook: string;
  instanceData: {
    idInstance: number;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage: string;
  senderData: {
    chatId: string;
    chatName?: string;
    sender: string;
    senderName?: string;
  };
  messageData: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    extendedTextMessageData?: {
      text: string;
    };
  };
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

// GetStateInstance Response
export interface StateInstanceResponse {
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting';
}

// Error Response
export interface GreenApiErrorResponse {
  error?: string;
  message?: string;
}

// Domain types for our application
export interface DomainMessage {
  id: string;
  clientId: string;
  chatId: string;
  text: string;
  direction: 'incoming' | 'outgoing';
  status: 'sending' | 'sent' | 'received' | 'failed';
  createdAt: string;
  error?: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
  clientId: string;
}

export interface CreateChatRequest {
  phoneNumber: string;
}
