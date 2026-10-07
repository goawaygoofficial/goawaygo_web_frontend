import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearStoredUser,
  loadStoredUser,
  saveStoredUser,
  verifyUser,
} from '@/features/auth/services/userService';
import type { User } from '@/types';
import { UserContext } from './UserContext';
import type { UserContextValue, UserStatus } from './UserContext';

/** Web counterpart of the Flutter `UserProvider`: holds the signed-in user and persists it. */
export function UserProvider({ children }: { children: ReactNode }) {
  const [initialUser] = useState(loadStoredUser);
  const [user, setUserState] = useState<User | null>(initialUser);
  const [status, setStatus] = useState<UserStatus>(initialUser ? 'restoring' : 'ready');

  useEffect(() => {
    if (!initialUser) return;
    const controller = new AbortController();
    verifyUser(initialUser.id, controller.signal)
      .then((result) => {
        if (result === 'invalid') {
          clearStoredUser();
          setUserState(null);
        }
        setStatus('ready');
      })
      .catch(() => {
        // Aborted on unmount — nothing to update.
      });
    return () => {
      controller.abort();
    };
  }, [initialUser]);

  const setUser = useCallback((next: User) => {
    saveStoredUser(next);
    setUserState(next);
  }, []);

  const clearUser = useCallback(() => {
    clearStoredUser();
    setUserState(null);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({ user, status, setUser, clearUser }),
    [user, status, setUser, clearUser],
  );

  return <UserContext value={value}>{children}</UserContext>;
}
