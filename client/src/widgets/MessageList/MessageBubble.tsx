/**
 * Individual message bubble
 */

import { Check, CheckCheck, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui';
import { cn, formatTime } from '@/shared/lib/utils';
import { useRetryMessage } from '@/features/send-message/useRetryMessage';
import type { Message } from '@/shared/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'outgoing';
  const retryMessage = useRetryMessage();

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'received':
        return <CheckCheck className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const handleRetry = () => {
    retryMessage.mutate({ chatId: message.chatId, message });
  };

  return (
    <div
      className={cn(
        'flex',
        isOutgoing ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'group relative max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
          isOutgoing
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border'
        )}
      >
        {/* Message text */}
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.text}
        </p>

        {/* Message metadata */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOutgoing && getStatusIcon()}
        </div>

        {/* Error message with retry button */}
        {message.status === 'failed' && (
          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-destructive">
              {message.error || 'Failed to send'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={retryMessage.isPending}
              className="h-6 px-2 text-xs"
            >
              {retryMessage.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Retry
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
