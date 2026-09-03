'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { sha256 } from 'js-sha256';

interface PasswordGateProps {
  children: React.ReactNode;
  correctPasswordHash: string; // SHA-256 hash of the password
  storageKey?: string;
}

// sessionStorage does not change underneath us in this tab, so there is nothing
// to subscribe to.
const NO_OP_SUBSCRIBE = () => () => {};

export default function PasswordGate({
  children,
  correctPasswordHash,
  storageKey = 'auth-token'
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlockedThisSession, setUnlockedThisSession] = useState(false);

  // Read the session token here rather than in an effect: the server and
  // hydration snapshot is undefined, so mounting no longer cascades a render.
  const storedToken = useSyncExternalStore(
    NO_OP_SUBSCRIBE,
    () => sessionStorage.getItem(storageKey),
    () => undefined
  );

  const isLoading = storedToken === undefined;
  const isAuthenticated = unlockedThisSession || storedToken === correctPasswordHash;

  const hashPassword = (pwd: string): string => {
    return sha256(pwd);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (typeof window === 'undefined') {
      setError('Client-side environment required');
      return;
    }

    try {
      const hash = hashPassword(password);

      if (hash === correctPasswordHash) {
        sessionStorage.setItem(storageKey, hash);
        setUnlockedThisSession(true);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Authentication error: ' + (err instanceof Error ? err.message : 'Unknown'));
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#10141B] flex items-center justify-center">
        <div className="text-[#8891A3]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#10141B] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#171C25] border border-[#2A3140] rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7ED6A0] to-[#0E5B30] flex items-center justify-center">
                <span className="text-[#0B120D] font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#E7EAEF]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Warm Outreach
                </h1>
                <p className="text-sm text-[#8891A3]" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  Password required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm text-[#8891A3] mb-2">
                  Enter password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#10141B] border border-[#2A3140] rounded-lg px-4 py-3 text-[#E7EAEF] focus:outline-none focus:border-[#565F72] focus:ring-2 focus:ring-[#7ED6A0] focus:ring-opacity-20"
                  placeholder="••••••••"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-[#E86A5D]">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#2C9E5C] to-[#197C43] text-white font-medium py-3 rounded-lg hover:from-[#49BC7C] hover:to-[#2C9E5C] transition-all duration-200 active:scale-[0.98]"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
