import { createContext } from 'react';
import type { User } from '@/types';

export type UserStatus = 'restoring' | 'ready';

export interface UserContextValue {
  user: User | null;
  /** `restoring` while the session is being restored from the refresh cookie on page load. */
  status: UserStatus;
  /** Call after a successful sign-in (the session itself is already stored by the auth service). */
  signIn: (user: User) => void;
  /** Revokes the session on the server and signs out locally. */
  signOut: () => Promise<void>;
  /** Re-reads the signed-in user from the server (e.g. after the email was verified). No-op when signed out. */
  reloadUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue | null>(null);
