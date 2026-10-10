import { apiRequest } from '@/lib/apiClient';
import { endSession, refreshSession, startSession } from '@/lib/session';
import type { SessionDto } from '@/lib/session';
import { userFromDto } from '@/types';
import type { User } from '@/types';
import type {
  AuthResult,
  ForgotPasswordRequest,
  GoogleSignInRequest,
  SignInRequest,
  SignUpRequest,
} from '../types';

function toAuthResult(session: SessionDto): AuthResult {
  return { user: userFromDto(session.user), expiresIn: session.expiresIn };
}

/** Creates an account (201). The user signs in afterwards. */
export async function signUp(request: SignUpRequest): Promise<void> {
  await apiRequest<unknown>('/api/auth/signup', {
    method: 'POST',
    body: request,
    expectedStatus: 201,
    fallbackError: 'Signup failed',
  });
}

/** Email + password. The refresh token arrives as an HttpOnly cookie; the access token stays in memory. */
export async function signIn(request: SignInRequest): Promise<AuthResult> {
  const data = await apiRequest<unknown>('/api/auth/signin', {
    method: 'POST',
    body: request,
    expectedStatus: 200,
    fallbackError: 'Signin failed',
  });
  return toAuthResult(startSession(data));
}

export async function signInWithGoogle(request: GoogleSignInRequest): Promise<AuthResult> {
  const data = await apiRequest<unknown>('/api/auth/google-signin', {
    method: 'POST',
    body: request,
    expectedStatus: 200,
    fallbackError: 'Google Signin failed',
  });
  return toAuthResult(startSession(data));
}

/**
 * Restores the session after a page load from the refresh cookie.
 * Resolves `null` when signed out; rejects only if the server is unreachable.
 */
export async function restoreSession(): Promise<User | null> {
  const session = await refreshSession();
  return session ? userFromDto(session.user) : null;
}

/** Revokes the refresh token on the server and clears the local session, even if the server is unreachable. */
export async function signOut(): Promise<void> {
  try {
    await apiRequest<unknown>('/api/auth/logout', {
      method: 'POST',
      expectedStatus: 204,
      fallbackError: 'Sign out failed',
    });
  } catch {
    // Still sign out locally; the server-side token expires on its own.
  } finally {
    endSession();
  }
}

/** Asks for a password-reset link by email. The answer never reveals whether the account exists. */
export async function requestPasswordReset(request: ForgotPasswordRequest): Promise<void> {
  await apiRequest<unknown>('/api/auth/forgot-password', {
    method: 'POST',
    body: request,
    fallbackError: 'Failed to request password reset',
  });
}
