import { useOutletContext } from 'react-router-dom';
import { routes } from '@/lib/routes';

/**
 * Where a sign-in flow lives. Sign-in happens on the sign-in page and, inline, on the Profile tab; each has its own
 * Register / Forgot Password overlays, and returns to its own screen when they close.
 */
export interface AuthFlow {
  /** The screen with the sign-in panel; overlays go back here. */
  signInPath: string;
  registerPath: string;
  forgotPasswordPath: string;
  /** Opened after a successful sign-in. */
  redirectTo: string;
}

export const authFlows = {
  signInPage: {
    signInPath: routes.auth,
    registerPath: routes.register,
    forgotPasswordPath: routes.forgotPassword,
    redirectTo: routes.home,
  },
  profile: {
    signInPath: routes.profile,
    registerPath: routes.profileRegister,
    forgotPasswordPath: routes.profileForgotPassword,
    // Signing in on the Profile tab keeps the user there.
    redirectTo: routes.profile,
  },
} as const satisfies Record<string, AuthFlow>;

/** The flow of the screen rendering this overlay (passed as its `<Outlet context>`). */
export function useAuthFlow(): AuthFlow {
  return useOutletContext<AuthFlow | undefined>() ?? authFlows.signInPage;
}
