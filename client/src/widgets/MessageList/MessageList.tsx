/**
 * Message list with auto-scroll
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useMessageStore } from '@/entities/message/hooks';
import { MessageBubble } from './MessageBubble';
import { AUTO_SCROLL_THRESHOLD } from '@/shared/config/constants';

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messages = useMessageStore((state) => state.getMessages(chatId));

  // Check if user is near bottom
  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < AUTO_SCROLL_THRESHOLD;
  };

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
    setShowScrollButton(false);
    setUnreadCount(0);
  };

  // Handle scroll
  const handleScroll = () => {
    if (isNearBottom()) {
      setShowScrollButton(false);
      setUnreadCount(0);
    } else {
      setShowScrollButton(true);
    }
  };

  // Auto-scroll on new messages (only if near bottom)
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const wasNearBottom = isNearBottom();

    if (wasNearBottom) {
      // User is at bottom, auto-scroll
      setTimeout(() => scrollToBottom(true), 100);
    } else {
      // User is reading old messages, show notification
      if (lastMessage.direction === 'incoming') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages.length]);

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom(false);
  }, [chatId]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No messages yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto scrollbar-thin p-4"
    >
      <div className="space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.clientId} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
