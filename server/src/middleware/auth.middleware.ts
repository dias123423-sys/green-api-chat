/**
 * Session authentication middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/session.service.js';

export interface AuthenticatedRequest extends Request {
  sessionId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    res.status(401).json({
      error: 'No session ID provided',
      message: 'Please provide X-Session-ID header',
    });
    return;
  }

  const session = sessionService.getSession(sessionId);

  if (!session) {
    res.status(401).json({
      error: 'Invalid session',
      message: 'Session not found or expired',
    });
    return;
  }

  req.sessionId = sessionId;
  next();
}
