/**
 * Parse GREEN-API notifications into domain messages
 */

import type { Notification, DomainMessage } from './types.js';
import { generateClientId } from '../services/utils.js';

/**
 * Extract text from notification message data
 */
function extractMessageText(notification: Notification): string | null {
  const messageData = notification.body.messageData;

  if (messageData.textMessageData?.textMessage) {
    return messageData.textMessageData.textMessage;
  }

  if (messageData.extendedTextMessageData?.text) {
    return messageData.extendedTextMessageData.text;
  }

  return null;
}

/**
 * Extract chat ID from notification
 */
function extractChatId(notification: Notification): string {
  return notification.body.senderData.chatId;
}

/**
 * Check if notification is an incoming text message
 */
export function isIncomingTextMessage(notification: Notification): boolean {
  const typeWebhook = notification.body.typeWebhook;
  const typeMessage = notification.body.messageData.typeMessage;

  return (
    typeWebhook === 'incomingMessageReceived' &&
    (typeMessage === 'textMessage' || typeMessage === 'extendedTextMessage')
  );
}

/**
 * Parse notification into domain message
 */
export function parseNotificationToMessage(
  notification: Notification
): DomainMessage | null {
  if (!isIncomingTextMessage(notification)) {
    return null;
  }

  const text = extractMessageText(notification);
  if (!text) {
    return null;
  }

  const chatId = extractChatId(notification);
  const timestamp = new Date(notification.body.timestamp * 1000).toISOString();

  return {
    id: notification.body.idMessage,
    clientId: generateClientId(),
    chatId,
    text,
    direction: 'incoming',
    status: 'received',
    createdAt: timestamp,
  };
}
