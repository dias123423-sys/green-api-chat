/**
 * SSE Events routes
 * Real-time message streaming via Server-Sent Events
 */

import { Router } from 'express';
import type { Response, Request } from 'express';
import { notificationService } from '../services/notification.service.js';
import type { DomainMessage } from '../green-api/types.js';

const router = Router();

/**
 * GET /api/events
 * Subscribe to real-time messages via SSE
 */
router.get('/', (req: Request, res: Response) => {
  // Get session ID from header or query
  const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

  if (!sessionId) {
    res.status(401).json({ error: 'No session ID provided' });
    return;
  }

  // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write('data: {"type":"connected"}\n\n');

    // Message listener
    const listener = (message: DomainMessage) => {
      try {
        const data = JSON.stringify({
          type: 'message',
          data: message,
        });
        res.write(`data: ${data}\n\n`);
      } catch (error) {
        console.error('Error sending SSE message:', error);
      }
    };

    // Add listener
    notificationService.addListener(sessionId, listener);

    // Cleanup on connection close
    req.on('close', () => {
      notificationService.removeListener(sessionId, listener);
      console.log(`SSE connection closed for session: ${sessionId}`);
    });

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
    });
  }
);

export default router;
