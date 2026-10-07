import { createContext } from 'react';
import type { User } from '@/types';

export type UserStatus = 'restoring' | 'ready';

export interface UserContextValue {
  user: User | null;
  /** `restoring` while a stored user is being validated against the backend on boot. */
  status: UserStatus;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextValue | null>(null);
