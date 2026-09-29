/**
 * Connection page
 * First page users see - authenticate with GREEN-API
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectionForm } from '@/features/connection/ConnectionForm';
import { apiClient } from '@/shared/api/client';
import { useAppStore } from '@/shared/api/store';
import { ROUTES } from '@/shared/config/constants';
import type { GreenApiCredentials } from '@/shared/types';

export function ConnectPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [instanceState, setInstanceState] = useState<string | null>(null);

  const setConnectionStatus = useAppStore((state) => state.setConnectionStatus);
  const setCredentials = useAppStore((state) => state.setCredentials);
  const setSessionId = useAppStore((state) => state.setSessionId);

  const handleConnect = async (credentials: GreenApiCredentials) => {
    setIsLoading(true);
    setError(undefined);
    setInstanceState(null);

    try {
      // Test connection
      setConnectionStatus('connecting');
      const response = await apiClient.testConnection(credentials);

      // Save instance state
      setInstanceState(response.state);

      // Check if authorized
      if (response.state === 'notAuthorized') {
        setConnectionStatus('disconnected');
        setError(
          'Instance not authorized. Please scan QR code in your GREEN-API console first.'
        );
        setIsLoading(false);
        return;
      }

      if (response.state !== 'authorized') {
        setConnectionStatus('disconnected');
        setError(
          `Instance is in "${response.state}" state. Please check your GREEN-API console.`
        );
        setIsLoading(false);
        return;
      }

      // Save state
      setCredentials(credentials);
      setSessionId(response.sessionId);
      setConnectionStatus('connected');

      // Navigate to chat
      navigate(ROUTES.CHAT);
    } catch (err) {
      console.error('Connection failed:', err);
      setConnectionStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to GREEN-API. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <ConnectionForm
        onSubmit={handleConnect}
        isLoading={isLoading}
        error={error}
        instanceState={instanceState}
      />
    </div>
  );
}
