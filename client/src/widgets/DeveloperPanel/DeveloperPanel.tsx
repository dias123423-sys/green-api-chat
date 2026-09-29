/**
 * Developer Mode Panel
 * Shows technical details, activity timeline, and message inspector
 */

import { X, Activity, MessageSquare, Wifi, Clock } from 'lucide-react';
import { Button, Badge, Card } from '@/shared/ui';
import { useAppStore } from '@/shared/api/store';
import { useMessageStore } from '@/entities/message/hooks';
import { useChatStore } from '@/entities/chat/hooks';
import { formatTime } from '@/shared/lib/utils';
import type { Message } from '@/shared/types';

export function DeveloperPanel() {
  const developerMode = useAppStore((state) => state.developerMode);
  const toggleDeveloperMode = useAppStore((state) => state.toggleDeveloperMode);
  const connectionStatus = useAppStore((state) => state.connectionStatus);
  const sessionId = useAppStore((state) => state.sessionId);
  const activeChatId = useAppStore((state) => state.activeChatId);
  
  const messages = useMessageStore((state) => 
    activeChatId ? state.messages[activeChatId] || [] : []
  );
  const chats = useChatStore((state) => state.chats);

  if (!developerMode) {
    return null;
  }

  const totalMessages = Object.values(useMessageStore.getState().messages)
    .flat()
    .length;

  const pendingMessages = messages.filter((m: Message) => m.status === 'sending').length;
  const failedMessages = messages.filter((m: Message) => m.status === 'failed').length;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border shadow-lg z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Developer Mode</h2>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleDeveloperMode}
          aria-label="Close Developer Mode"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Connection Info */}
        <Card>
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Connection
              </span>
              <Badge variant={connectionStatus === 'connected' ? 'success' : 'secondary'}>
                {connectionStatus}
              </Badge>
            </div>
            
            {sessionId && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Session ID:</span>
                  <code className="font-mono">{sessionId.slice(0, 8)}...</code>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <Card>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Statistics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Total Chats</span>
                <span className="font-semibold text-lg">{chats.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Total Messages</span>
                <span className="font-semibold text-lg">{totalMessages}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-lg text-yellow-600 dark:text-yellow-500">
                  {pendingMessages}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Failed</span>
                <span className="font-semibold text-lg text-destructive">
                  {failedMessages}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Chat Messages */}
        {activeChatId && messages.length > 0 && (
          <Card>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Active Chat Messages</span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages.slice(-5).reverse().map((message: Message) => (
                  <div
                    key={message.id}
                    className="p-2 rounded bg-muted/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        message.direction === 'outgoing' ? 'default' : 'secondary'
                      } className="text-[10px]">
                        {message.direction}
                      </Badge>
                      <Badge
                        variant={
                          message.status === 'sent' ? 'success' :
                          message.status === 'sending' ? 'secondary' :
                          message.status === 'failed' ? 'destructive' :
                          'outline'
                        }
                        className="text-[10px]"
                      >
                        {message.status}
                      </Badge>
                    </div>
                    
                    <div className="text-muted-foreground truncate">
                      {message.text}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <code className="font-mono">{message.id.slice(0, 12)}...</code>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <div className="p-3 space-y-2">
            <span className="text-sm font-medium">System Info</span>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>React:</span>
                <code>19.0.0</code>
              </div>
              <div className="flex justify-between">
                <span>TypeScript:</span>
                <code>Strict Mode</code>
              </div>
              <div className="flex justify-between">
                <span>State:</span>
                <code>Zustand + TanStack Query</code>
              </div>
              <div className="flex justify-between">
                <span>Real-time:</span>
                <code>SSE</code>
              </div>
            </div>
          </div>
        </Card>

        {/* Architecture Note */}
        <div className="text-xs text-muted-foreground p-3 rounded bg-primary/5 border border-primary/20">
          <p className="font-medium mb-1">Architecture Highlights:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Optimistic UI with rollback</li>
            <li>Domain-driven design</li>
            <li>Type-safe (no <code>any</code>)</li>
            <li>Feature-oriented structure</li>
            <li>Deduplication & retry logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
