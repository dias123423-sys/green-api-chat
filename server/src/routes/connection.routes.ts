/**
 * Connection routes
 * Handle GREEN-API authentication and connection testing
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { sessionService } from '../services/session.service.js';
import { notificationService } from '../services/notification.service.js';

const router = Router();

// Validation schema
const credentialsSchema = z.object({
  idInstance: z.string().min(1),
  apiTokenInstance: z.string().min(1),
});

/**
 * POST /api/connection/test
 * Test GREEN-API credentials and create session
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const credentials = credentialsSchema.parse(req.body);

    // Create session
    const sessionId = sessionService.createSession(credentials);
    const client = sessionService.getClient(sessionId);

    if (!client) {
      res.status(500).json({ error: 'Failed to create client' });
      return;
    }

    // Get instance state (also tests connection)
    const state = await client.getStateInstance();

    // Start notification polling
    notificationService.startPolling(sessionId, client);

    res.json({
      sessionId,
      state: state.stateInstance,
      message: 'Connected successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
      return;
    }

    console.error('Connection test error:', error);
    res.status(500).json({
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/connection
 * Disconnect and cleanup session
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      res.status(400).json({ error: 'No session ID provided' });
      return;
    }

    notificationService.cleanup(sessionId);
    sessionService.deleteSession(sessionId);

    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Disconnect failed' });
  }
});

export default router;
