import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncAction } from '@/hooks';
import { routes } from '@/lib/routes';
import { useDialog, useUser } from '@/providers';

export interface SignOutControl {
  /** Asks for confirmation, then revokes the session and opens the sign-in page. */
  signOut: () => void;
  /** True while the sign-out request is running. */
  pending: boolean;
  /**
   * True from the moment the user confirms until the page is left. Pages that redirect when there is no user
   * should render nothing while this is set: React Router navigates in a transition, so the page re-renders
   * without a user before the sign-in page takes over.
   */
  leaving: boolean;
}

/** The one sign-out flow (User Profile page's Sign Out button). */
export function useSignOut(): SignOutControl {
  const { signOut: endSession } = useUser();
  const { showConfirm } = useDialog();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const [pending, run] = useAsyncAction(
    useCallback(async () => {
      const confirmed = await showConfirm('Sign out of Goaway?', 'Sign out');
      if (!confirmed) return;
      setLeaving(true);
      await endSession();
      void navigate(routes.auth, { replace: true });
    }, [showConfirm, endSession, navigate]),
  );

  return { signOut: run, pending, leaving };
}
