import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useDialog, useUser } from '@/providers';
import type { AuthResult } from '../types';

/** Stores the signed-in user, shows the welcome dialog, then enters the app — shared by email and Google sign-in. */
export function useCompleteSignIn(): (result: AuthResult, greeting: string) => Promise<void> {
  const { setUser } = useUser();
  const { showSuccess } = useDialog();
  const navigate = useNavigate();

  return useCallback(
    async (result, greeting) => {
      setUser(result.user);
      await showSuccess(`${greeting}, ${result.user.name}!`);
      void navigate(routes.home, { replace: true });
    },
    [setUser, showSuccess, navigate],
  );
}
