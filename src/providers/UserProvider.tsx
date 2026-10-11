import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  fetchCurrentUser,
  restoreSession,
  signOut as endServerSession,
} from '@/features/auth/services/authService';
import { getAccessToken, onSessionChange } from '@/lib/session';
import { userFromDto } from '@/types';
import type { User } from '@/types';
import { UserContext } from './UserContext';
import type { UserContextValue, UserStatus } from './UserContext';

/** Key used by older versions, which stored the user object in localStorage. Removed on load. */
const LEGACY_STORAGE_KEY = 'user';

function removeLegacyStoredUser(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode): nothing to remove.
  }
}

/**
 * Holds the signed-in user. Nothing about the user is persisted in the browser: on load the session is restored
 * from the HttpOnly refresh cookie, which also proves the user is still allowed in.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<UserStatus>('restoring');

  useEffect(() => {
    removeLegacyStoredUser();
    let active = true;
    restoreSession()
      .then((restored) => {
        if (active) setUser(restored);
      })
      .catch(() => {
        // Server unreachable: continue signed out. The user can sign in once it is back.
      })
      .finally(() => {
        if (active) setStatus('ready');
      });
    return () => {
      active = false;
    };
  }, []);

  // Background refreshes update the user; an expired session (refresh rejected) signs out.
  useEffect(
    () =>
      onSessionChange((dto) => {
        setUser(dto ? userFromDto(dto) : null);
      }),
    [],
  );

  const signIn = useCallback((next: User) => {
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    await endServerSession();
    setUser(null);
  }, []);

  const reloadUser = useCallback(async () => {
    if (getAccessToken() === null) return;
    const fresh = await fetchCurrentUser();
    // Ignore the answer if the user signed out while it was loading.
    if (getAccessToken() !== null) setUser(fresh);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({ user, status, signIn, signOut, reloadUser }),
    [user, status, signIn, signOut, reloadUser],
  );

  return <UserContext value={value}>{children}</UserContext>;
}
