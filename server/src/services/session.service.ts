/**
 * Session management
 * Stores GREEN-API credentials per session
 */

import type { GreenApiCredentials } from '../green-api/types.js';
import { GreenApiClient } from '../green-api/client.js';

interface Session {
  credentials: GreenApiCredentials;
  client: GreenApiClient;
  createdAt: Date;
}

class SessionService {
  private sessions: Map<string, Session> = new Map();

  /**
   * Generate session ID
   */
  generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create new session
   */
  createSession(credentials: GreenApiCredentials): string {
    const sessionId = this.generateSessionId();
    const client = new GreenApiClient(credentials);

    this.sessions.set(sessionId, {
      credentials,
      client,
      createdAt: new Date(),
    });

    // Cleanup old sessions (> 24 hours)
    this.cleanupOldSessions();

    return sessionId;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get client for session
   */
  getClient(sessionId: string): GreenApiClient | undefined {
    const session = this.sessions.get(sessionId);
    return session?.client;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Cleanup sessions older than 24 hours
   */
  private cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get all sessions (for debugging)
   */
  getAllSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}

export const sessionService = new SessionService();
