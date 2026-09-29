/**
 * API Client
 * Handles all communication with backend
 */

import type { GreenApiCredentials } from '../types';
import { API_BASE_URL } from '../config/constants';

interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export class ApiClient {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    // Store in sessionStorage for persistence
    sessionStorage.setItem('sessionId', sessionId);
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    if (!this.sessionId) {
      this.sessionId = sessionStorage.getItem('sessionId');
    }
    return this.sessionId;
  }

  /**
   * Clear session
   */
  clearSession(): void {
    this.sessionId = null;
    sessionStorage.removeItem('sessionId');
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add session ID if available
    if (this.sessionId) {
      headers['X-Session-ID'] = this.sessionId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || error.error || 'Request failed');
      }

      return data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Test connection with credentials
   */
  async testConnection(credentials: GreenApiCredentials): Promise<{
    sessionId: string;
    state: string;
    message: string;
  }> {
    const response = await this.request<{
      sessionId: string;
      state: string;
      message: string;
    }>('/api/connection/test', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store session ID
    this.setSessionId(response.sessionId);

    return response;
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (!this.sessionId) return;

    await this.request('/api/connection', {
      method: 'DELETE',
    });

    this.clearSession();
  }

  /**
   * Create chat
   */
  async createChat(phoneNumber: string): Promise<{
    chatId: string;
    phoneNumber: string;
    createdAt: string;
  }> {
    return this.request('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  /**
   * Send message
   */
  async sendMessage(chatId: string, message: string): Promise<{
    idMessage: string;
    chatId: string;
    message: string;
    timestamp: string;
  }> {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
    });
  }

  /**
   * Subscribe to events (SSE)
   */
  subscribeToEvents(
    onMessage: (message: unknown) => void,
    onError?: (error: Error) => void
  ): () => void {
    if (!this.sessionId) {
      throw new Error('No session ID available');
    }

    const url = `${this.baseUrl}/api/events`;

    // Add session ID via query param since EventSource doesn't support headers
    const urlWithSession = `${url}?sessionId=${this.sessionId}`;
    const es = new EventSource(urlWithSession);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError?.(new Error('Connection lost'));
    };

    // Cleanup function
    return () => {
      es.close();
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
