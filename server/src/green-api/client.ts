/**
 * GREEN-API HTTP Client
 * Handles all communication with GREEN-API
 */

import type {
  GreenApiCredentials,
  SendMessageResponse,
  Notification,
  StateInstanceResponse,
  GreenApiErrorResponse,
} from './types.js';

export class GreenApiClient {
  private baseUrl = 'https://api.green-api.com';

  constructor(private credentials: GreenApiCredentials) {}

  /**
   * Build API URL with credentials
   */
  private getApiUrl(method: string): string {
    return `${this.baseUrl}/waInstance${this.credentials.idInstance}/${method}/${this.credentials.apiTokenInstance}`;
  }

  /**
   * Make HTTP request to GREEN-API
   */
  private async request<T>(
    method: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.getApiUrl(method);
    console.log(`[GREEN-API] Calling: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log(`[GREEN-API] Response status: ${response.status}`);
      
      // Try to get response text first
      const responseText = await response.text();
      console.log(`[GREEN-API] Response body: ${responseText.substring(0, 200)}`);
      
      // Handle empty response (no notifications available)
      if (!responseText || responseText.trim() === '') {
        console.log('[GREEN-API] Empty response (no data)');
        return null as T;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[GREEN-API] Failed to parse JSON response');
        throw new Error(`Invalid JSON response from GREEN-API: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        // Handle 403 specially
        if (response.status === 403) {
          throw new Error(
            'GREEN-API credentials rejected (403 Forbidden). ' +
            'Please verify your idInstance and apiTokenInstance are correct and active. ' +
            'Check your GREEN-API console at https://console.green-api.com/'
          );
        }
        
        const error = data as GreenApiErrorResponse;
        throw new Error(error.error || error.message || `GREEN-API request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.error(`GREEN-API request failed: ${method}`, error);
      throw error;
    }
  }

  /**
   * Send text message
   * https://green-api.com/v3/docs/api/sending/SendMessage/
   */
  async sendMessage(
    chatId: string,
    message: string
  ): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('sendMessage', {
      method: 'POST',
      body: JSON.stringify({
        chatId,
        message,
      }),
    });
  }

  /**
   * Receive notification (polling)
   * https://green-api.com/v3/docs/api/receiving/technology-http-api/
   */
  async receiveNotification(): Promise<Notification | null> {
    try {
      const response = await this.request<Notification | null>(
        'receiveNotification',
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to receive notification:', error);
      return null;
    }
  }

  /**
   * Delete notification after processing
   * https://green-api.com/v3/docs/api/receiving/technology-http-api/
   */
  async deleteNotification(receiptId: number): Promise<boolean> {
    try {
      await this.request<{ result: boolean }>('deleteNotification', {
        method: 'DELETE',
        body: JSON.stringify({
          receiptId,
        }),
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete notification ${receiptId}:`, error);
      return false;
    }
  }

  /**
   * Get instance state (authorized/notAuthorized)
   * https://green-api.com/v3/docs/api/account/GetStateInstance/
   */
  async getStateInstance(): Promise<StateInstanceResponse> {
    return this.request<StateInstanceResponse>('getStateInstance', {
      method: 'GET',
    });
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const state = await this.getStateInstance();
      return !!state.stateInstance;
    } catch {
      return false;
    }
  }
}
