/**
 * Message routes
 * Handle sending messages
 */

import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { sessionService } from '../services/session.service.js';

const router = Router();

// Validation schema
const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  message: z.string().min(1).max(4096),
});

/**
 * POST /api/messages
 * Send text message
 */
router.post(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { chatId, message } = sendMessageSchema.parse(req.body);
      const sessionId = req.sessionId!;

      const client = sessionService.getClient(sessionId);

      if (!client) {
        res.status(401).json({ error: 'Session not found' });
        return;
      }

      // Send message via GREEN-API
      const response = await client.sendMessage(chatId, message);

      res.json({
        idMessage: response.idMessage,
        chatId,
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      console.error('Send message error:', error);
      res.status(500).json({
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
