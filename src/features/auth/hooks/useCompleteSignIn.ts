import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useDialog, useUser } from '@/providers';
import type { AuthResult } from '../types';

/**
 * Stores the signed-in user, shows the welcome dialog, then opens `redirectTo` (Home by default) — shared by
 * email and Google sign-in.
 */
export function useCompleteSignIn(
  redirectTo: string = routes.home,
): (result: AuthResult, greeting: string) => Promise<void> {
  const { signIn } = useUser();
  const { showSuccess } = useDialog();
  const navigate = useNavigate();

  return useCallback(
    async (result, greeting) => {
      signIn(result.user);
      await showSuccess(
        result.restored
          ? `Welcome back, ${result.user.name}! Your account won't be deleted.`
          : `${greeting}, ${result.user.name}!`,
      );
      void navigate(redirectTo, { replace: true });
    },
    [signIn, showSuccess, navigate, redirectTo],
  );
}
