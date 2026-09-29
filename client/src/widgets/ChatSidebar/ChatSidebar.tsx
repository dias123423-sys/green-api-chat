/**
 * Chat sidebar with chat list
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Avatar, Badge, Skeleton } from '@/shared/ui';
import { useChatStore } from '@/entities/chat/hooks';
import { useAppStore } from '@/shared/api/store';
import { CreateChatModal } from '@/features/create-chat/CreateChatModal';
import { formatTime, truncate } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

export function ChatSidebar() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const chats = useChatStore((state) => state.chats);
  const activeChatId = useAppStore((state) => state.activeChatId);
  const setActiveChatId = useAppStore((state) => state.setActiveChatId);

  return (
    <>
      <div className="flex h-full flex-col border-r border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowCreateModal(true)}
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <Button
                variant="link"
                onClick={() => setShowCreateModal(true)}
                className="mt-2"
              >
                Start your first chat
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    'flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent focus-ring',
                    activeChatId === chat.id && 'bg-accent'
                  )}
                >
                  <Avatar name={chat.displayName || chat.phoneNumber} />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">
                        {chat.displayName || chat.phoneNumber}
                      </p>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {truncate(chat.lastMessage, 50)}
                      </p>
                    )}
                  </div>

                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateChatModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}

export function ChatSidebarSkeleton() {
  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="flex-1 space-y-0 divide-y divide-border p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
