/**
 * Chat page
 * Main chat interface
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/widgets/ChatHeader/ChatHeader';
import { ChatSidebar } from '@/widgets/ChatSidebar/ChatSidebar';
import { MessageList } from '@/widgets/MessageList/MessageList';
import { MessageComposer } from '@/widgets/MessageComposer/MessageComposer';
import { DeveloperPanel } from '@/widgets/DeveloperPanel';
import { useAppStore } from '@/shared/api/store';
import { useSendMessage } from '@/features/send-message/useSendMessage';
import { useMessageStream } from '@/features/receive-message/useMessageStream';
import { ROUTES } from '@/shared/config/constants';

export function ChatPage() {
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);
  const activeChatId = useAppStore((state) => state.activeChatId);

  const sendMessage = useSendMessage();

  // Start SSE stream for real-time messages
  const { isConnected, error: streamError } = useMessageStream();

  // Redirect to connect if not authenticated
  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.CONNECT);
    }
  }, [sessionId, navigate]);

  const handleSendMessage = async (text: string) => {
    if (!activeChatId) return;

    try {
      await sendMessage.mutateAsync({
        chatId: activeChatId,
        text,
      });
    } catch (error) {
      // Error is already handled in useSendMessage
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatHeader isStreamConnected={isConnected} streamError={streamError} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 shrink-0">
          <ChatSidebar />
        </aside>

        {/* Main chat area */}
        <main className="flex flex-1 flex-col">
          {activeChatId ? (
            <>
              <MessageList chatId={activeChatId} />
              <MessageComposer
                onSend={handleSendMessage}
                disabled={!activeChatId}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Select a conversation</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  or create a new one to start messaging
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Developer Panel */}
        <DeveloperPanel />
      </div>
    </div>
  );
}

