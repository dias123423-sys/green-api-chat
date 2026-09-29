/**
 * Chat header with connection status
 */

import { Settings, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { Button, Avatar, Badge } from '@/shared/ui';
import { useAppStore } from '@/shared/api/store';
import { useChatStore } from '@/entities/chat/hooks';
import { useTheme } from '@/shared/hooks';
import { APP_NAME } from '@/shared/config/constants';

interface ChatHeaderProps {
  isStreamConnected?: boolean;
  streamError?: Error | null;
}

export function ChatHeader({
  isStreamConnected = false,
  streamError = null,
}: ChatHeaderProps) {
  const { setTheme, isDark } = useTheme();
  const connectionStatus = useAppStore((state) => state.connectionStatus);
  const activeChatId = useAppStore((state) => state.activeChatId);
  const toggleDeveloperMode = useAppStore((state) => state.toggleDeveloperMode);
  const developerMode = useAppStore((state) => state.developerMode);
  const getChat = useChatStore((state) => state.getChat);

  const activeChat = activeChatId ? getChat(activeChatId) : null;

  const handleToggleDeveloperMode = () => {
    toggleDeveloperMode();
    console.log('Developer Mode:', !developerMode ? 'ON' : 'OFF');
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="success">● Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary">● Connecting</Badge>;
      case 'reconnecting':
        return <Badge variant="secondary">● Reconnecting</Badge>;
      case 'error':
        return <Badge variant="destructive">● Error</Badge>;
      default:
        return <Badge variant="outline">○ Disconnected</Badge>;
    }
  };

  const getStreamStatusBadge = () => {
    if (streamError) {
      return (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Stream error
        </Badge>
      );
    }

    if (isStreamConnected) {
      return (
        <Badge variant="success" className="gap-1">
          <Wifi className="h-3 w-3" />
          Live
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      {/* Left: Chat info or app name */}
      <div className="flex items-center gap-3">
        {activeChat ? (
          <>
            <Avatar name={activeChat.displayName || activeChat.phoneNumber} />
            <div>
              <h1 className="font-semibold">
                {activeChat.displayName || activeChat.phoneNumber}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeChat.phoneNumber}
              </p>
            </div>
          </>
        ) : (
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {developerMode && (
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            Dev Mode
          </Badge>
        )}
        {getStatusBadge()}
        {getStreamStatusBadge()}

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggleDeveloperMode}
          aria-label="Developer mode"
          title="Toggle Developer Mode (Ctrl+Shift+D)"
          className={developerMode ? 'bg-primary/10 text-primary' : ''}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
