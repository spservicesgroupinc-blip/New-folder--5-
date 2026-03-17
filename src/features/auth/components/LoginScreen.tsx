/**
 * LoginScreen.tsx
 *
 * Full-screen login form supporting two modes:
 *   - Admin: username + password
 *   - Crew:  username + PIN
 *
 * Dark-themed, consistent with the rest of the app's slate palette.
 */

import React, { useState, type FormEvent } from 'react';

import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { cn } from '../../../shared/utils/classNames';
import { useAuth } from '../hooks/useAuth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LoginMode = 'admin' | 'crew';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginScreen() {
  const { login, loginCrew, isLoading } = useAuth();

  const [mode, setMode] = useState<LoginMode>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'admin') {
        await login(username, password);
      } else {
        await loginCrew(username, pin);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">FoamPro</h1>
          <p className="text-sm text-slate-400">Sign in to your account</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg bg-slate-800 p-1 gap-1">
          {(['admin', 'crew'] as LoginMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors duration-150 capitalize',
                mode === m
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {m === 'admin' ? 'Admin' : 'Crew'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />

          {mode === 'admin' ? (
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          ) : (
            <Input
              label="PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              disabled={isLoading}
              hint="Enter your numeric crew PIN"
            />
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            {mode === 'admin' ? 'Sign In' : 'Enter as Crew'}
          </Button>
        </form>
      </div>
    </div>
  );
}
