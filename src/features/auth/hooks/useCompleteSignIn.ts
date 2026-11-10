import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useDialog, useUser } from '@/providers';
import type { AuthResult } from '../types';
import { t } from '@/lib/i18n';

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
          ? t("Welcome back, {0}! Your account won't be deleted.", result.user.name)
          : t('{0}, {1}!', t(greeting), result.user.name),
      );
      void navigate(redirectTo, { replace: true });
    },
    [signIn, showSuccess, navigate, redirectTo],
  );
}
