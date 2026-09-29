/**
 * Chat routes
 * Handle chat creation
 */

import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { formatChatId } from '../services/utils.js';

const router = Router();

// Validation schema
const createChatSchema = z.object({
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number'),
});

/**
 * POST /api/chats
 * Create new chat
 */
router.post(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { phoneNumber } = createChatSchema.parse(req.body);

      // Format phone number to chat ID
      const chatId = formatChatId(phoneNumber);

      res.json({
        chatId,
        phoneNumber,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      console.error('Create chat error:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  }
);

export default router;
