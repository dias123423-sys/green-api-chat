/**
 * Create chat modal
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Modal, Button, Input } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { useChatStore } from '@/entities/chat/hooks';
import { useAppStore } from '@/shared/api/store';
import { formatPhoneNumber } from '@/shared/lib/utils';

const createChatSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?\d{10,15}$/, 'Invalid phone number format (e.g., +77771234567)'),
});

type CreateChatFormData = z.infer<typeof createChatSchema>;

interface CreateChatModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateChatModal({ open, onClose }: CreateChatModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const addChat = useChatStore((state) => state.addChat);
  const setActiveChatId = useAppStore((state) => state.setActiveChatId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateChatFormData>({
    resolver: zodResolver(createChatSchema),
  });

  const onSubmit = async (data: CreateChatFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await apiClient.createChat(data.phoneNumber);

      // Add chat to store
      addChat({
        id: response.chatId,
        phoneNumber: response.phoneNumber,
        displayName: formatPhoneNumber(response.phoneNumber),
      });

      // Set as active chat
      setActiveChatId(response.chatId);

      // Close modal and reset form
      onClose();
      reset();
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create chat'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      reset();
      setError(undefined);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New conversation"
      description="Enter a phone number to start chatting"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone number
          </label>
          <Input
            id="phoneNumber"
            placeholder="+77771234567"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
            disabled={isLoading}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +7 for Kazakhstan)
          </p>
        </div>

        {error && (
          <div
            className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Start chat'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
