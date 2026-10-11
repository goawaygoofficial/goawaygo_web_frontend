import { useCallback } from 'react';
import { toErrorMessage } from '@/lib/apiClient';
import { useDialog, useUser } from '@/providers';
import { resendVerificationEmail } from '../services/authService';

/**
 * Emails the signed-in user a new verification link and says so in a dialog. On failure the user is re-read, so a
 * "verify your email" prompt disappears if the email turns out to be verified already (e.g. in another tab).
 */
export function useResendVerification(): () => Promise<void> {
  const { user, reloadUser } = useUser();
  const { showError, showSuccess } = useDialog();
  const email = user?.email;

  return useCallback(async () => {
    try {
      await resendVerificationEmail();
      await showSuccess(`We've sent a new verification link to ${email ?? 'your email'}.`);
    } catch (error) {
      await reloadUser().catch(() => undefined);
      await showError(toErrorMessage(error, 'Failed to send verification email'));
    }
  }, [email, reloadUser, showError, showSuccess]);
}
