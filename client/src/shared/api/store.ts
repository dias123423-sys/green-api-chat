/**
 * Global state store using Zustand
 */

import { create } from 'zustand';
import type { ConnectionStatus, GreenApiCredentials } from '../types';

interface AppStore {
  // Connection state
  connectionStatus: ConnectionStatus;
  credentials: GreenApiCredentials | null;
  sessionId: string | null;
  
  // UI state
  activeChatId: string | null;
  developerMode: boolean;
  
  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setCredentials: (credentials: GreenApiCredentials | null) => void;
  setSessionId: (sessionId: string | null) => void;
  setActiveChatId: (chatId: string | null) => void;
  toggleDeveloperMode: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  connectionStatus: 'disconnected' as ConnectionStatus,
  credentials: null,
  sessionId: null,
  activeChatId: null,
  developerMode: false,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  setCredentials: (credentials) => set({ credentials }),
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  
  toggleDeveloperMode: () =>
    set((state) => ({ developerMode: !state.developerMode })),
  
  reset: () => set(initialState),
}));
