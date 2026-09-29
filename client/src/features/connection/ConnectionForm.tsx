/**
 * Connection form component
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

const connectionSchema = z.object({
  idInstance: z.string().min(1, 'Instance ID is required'),
  apiTokenInstance: z.string().min(1, 'API Token is required'),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

interface ConnectionFormProps {
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  instanceState?: string | null;
}

export function ConnectionForm({ onSubmit, isLoading, error, instanceState }: ConnectionFormProps) {
  const [showToken, setShowToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          GREEN-API Chat
        </CardTitle>
        <CardDescription className="text-center">
          Connect your messaging instance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ID Instance */}
          <div className="space-y-2">
            <label htmlFor="idInstance" className="text-sm font-medium">
              ID Instance
            </label>
            <Input
              id="idInstance"
              placeholder="7201234567890"
              {...register('idInstance')}
              error={errors.idInstance?.message}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {/* API Token */}
          <div className="space-y-2">
            <label htmlFor="apiTokenInstance" className="text-sm font-medium">
              API Token
            </label>
            <div className="relative">
              <Input
                id="apiTokenInstance"
                type={showToken ? 'text' : 'password'}
                placeholder="Your API token"
                {...register('apiTokenInstance')}
                error={errors.apiTokenInstance?.message}
                disabled={isLoading}
                autoComplete="off"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={showToken ? 'Hide token' : 'Show token'}
                disabled={isLoading}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive space-y-2"
              role="alert"
            >
              <p className="font-medium">{error}</p>
              {error.includes('403') && (
                <div className="text-xs space-y-1 mt-2 pt-2 border-t border-destructive/20">
                  <p className="font-medium">Common solutions:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Verify credentials in your <a href="https://console.green-api.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-destructive">GREEN-API console</a></li>
                    <li>Check if instance is active (not blocked/suspended)</li>
                    <li>Ensure apiTokenInstance is complete and correct</li>
                  </ul>
                </div>
              )}
              {instanceState === 'notAuthorized' && (
                <div className="text-xs space-y-2 mt-2 pt-2 border-t border-destructive/20">
                  <p className="font-medium">Authorization required:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Open <a href="https://console.green-api.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-destructive">GREEN-API console</a></li>
                    <li>Find your instance and click "Scan QR code"</li>
                    <li>Scan the QR code with WhatsApp on your phone</li>
                    <li>Wait for "authorized" status, then try connecting again</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>

          {/* Info text */}
          <p className="text-center text-xs text-muted-foreground">
            Credentials are used only for this session
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
