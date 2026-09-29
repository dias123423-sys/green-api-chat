/**
 * Notification processing service
 * Handles polling, deduplication, and broadcasting
 */

import type { DomainMessage } from '../green-api/types.js';
import { GreenApiClient } from '../green-api/client.js';
import { parseNotificationToMessage } from '../green-api/parser.js';

export type MessageListener = (message: DomainMessage) => void;

class NotificationService {
  private processedNotifications: Set<string> = new Set();
  private listeners: Map<string, Set<MessageListener>> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly POLLING_INTERVAL = 5000; // 5 seconds
  private readonly MAX_PROCESSED_CACHE = 1000;

  /**
   * Start polling for notifications
   */
  startPolling(sessionId: string, client: GreenApiClient): void {
    // Stop existing polling if any
    this.stopPolling(sessionId);

    const interval = setInterval(async () => {
      try {
        await this.pollNotifications(sessionId, client);
      } catch (error) {
        console.error(`Polling error for session ${sessionId}:`, error);
      }
    }, this.POLLING_INTERVAL);

    this.pollingIntervals.set(sessionId, interval);
    console.log(`Started polling for session: ${sessionId}`);
  }

  /**
   * Stop polling
   */
  stopPolling(sessionId: string): void {
    const interval = this.pollingIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(sessionId);
      console.log(`Stopped polling for session: ${sessionId}`);
    }
  }

  /**
   * Poll for new notifications
   */
  private async pollNotifications(
    sessionId: string,
    client: GreenApiClient
  ): Promise<void> {
    try {
      const notification = await client.receiveNotification();

      if (!notification) {
        return; // No notification available
      }

      const notificationId = `${notification.receiptId}-${notification.body.idMessage}`;

      // Check for duplicates
      if (this.processedNotifications.has(notificationId)) {
        console.log(`Duplicate notification: ${notificationId}`);
        await client.deleteNotification(notification.receiptId);
        return;
      }

      // Parse notification to domain message
      const message = parseNotificationToMessage(notification);

      if (message) {
        // Mark as processed
        this.markAsProcessed(notificationId);

        // Broadcast to listeners
        this.broadcast(sessionId, message);

        console.log(`Processed notification: ${notificationId}`);
      }

      // Delete notification from GREEN-API
      await client.deleteNotification(notification.receiptId);
    } catch (error) {
      console.error('Failed to poll notifications:', error);
    }
  }

  /**
   * Mark notification as processed
   */
  private markAsProcessed(notificationId: string): void {
    this.processedNotifications.add(notificationId);

    // Prevent memory leak by limiting cache size
    if (this.processedNotifications.size > this.MAX_PROCESSED_CACHE) {
      const firstItem = this.processedNotifications.values().next().value;
      if (firstItem) {
        this.processedNotifications.delete(firstItem);
      }
    }
  }

  /**
   * Add message listener
   */
  addListener(sessionId: string, listener: MessageListener): void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)?.add(listener);
  }

  /**
   * Remove message listener
   */
  removeListener(sessionId: string, listener: MessageListener): void {
    this.listeners.get(sessionId)?.delete(listener);
  }

  /**
   * Broadcast message to all listeners
   */
  private broadcast(sessionId: string, message: DomainMessage): void {
    const listeners = this.listeners.get(sessionId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error('Error in message listener:', error);
        }
      });
    }
  }

  /**
   * Cleanup session
   */
  cleanup(sessionId: string): void {
    this.stopPolling(sessionId);
    this.listeners.delete(sessionId);
  }
}

export const notificationService = new NotificationService();
