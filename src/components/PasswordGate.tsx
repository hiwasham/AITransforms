'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { sha256 } from 'js-sha256';

interface PasswordGateProps {
  children: React.ReactNode;
  correctPasswordHash: string; // SHA-256 hash of the password
  storageKey?: string;
}

export default function PasswordGate({
  children,
  correctPasswordHash,
  storageKey = 'auth-token'
}: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem(storageKey);
      if (token === correctPasswordHash) {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, [correctPasswordHash, storageKey]);

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
      console.log('Generated hash:', hash);
      console.log('Expected hash:', correctPasswordHash);
      console.log('Match:', hash === correctPasswordHash);

      if (hash === correctPasswordHash) {
        sessionStorage.setItem(storageKey, hash);
        setIsAuthenticated(true);
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
