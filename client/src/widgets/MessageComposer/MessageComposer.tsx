/**
 * Message composer with auto-resize textarea
 */

import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, Textarea } from '@/shared/ui';
import { MAX_MESSAGE_LENGTH } from '@/shared/config/constants';

interface MessageComposerProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && text.length <= MAX_MESSAGE_LENGTH;

  const handleSend = async () => {
    if (!canSend || isSending) return;

    const messageText = text.trim();
    setText('');
    setIsSending(true);

    try {
      await onSend(messageText);
      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (error) {
      // Restore text on error
      setText(messageText);
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={disabled || isSending}
            className="min-h-[44px] max-h-32 resize-none pr-16"
            rows={1}
          />
          
          {/* Character count */}
          {text.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <span
              className={cn(
                'absolute bottom-2 right-2 text-xs',
                text.length > MAX_MESSAGE_LENGTH
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              {text.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={!canSend || disabled || isSending}
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1">Enter</kbd> to send,{' '}
        <kbd className="rounded bg-muted px-1">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
