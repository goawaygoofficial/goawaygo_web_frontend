import { apiRequest } from '@/lib/apiClient';
import { endSession, refreshSession, startSession } from '@/lib/session';
import type { SessionDto } from '@/lib/session';
import { isUserDto, userFromDto } from '@/types';
import type { User } from '@/types';
import type {
  AuthResult,
  ForgotPasswordRequest,
  GoogleCodeSignInRequest,
  ResetPasswordRequest,
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

/**
 * Google sign-in with the one-time authorization code from Google's popup. The backend exchanges it with Google
 * (using the client secret, which never reaches the browser) and verifies the resulting ID token.
 */
export async function signInWithGoogleCode(request: GoogleCodeSignInRequest): Promise<AuthResult> {
  const data = await apiRequest<unknown>('/api/auth/google-signin/code', {
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

/**
 * Sets a new password with the token from the emailed link. The backend signs out every session of the account,
 * so the user signs in again afterwards.
 */
export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  await apiRequest<unknown>('/api/auth/reset-password', {
    method: 'POST',
    body: request,
    expectedStatus: 204,
    fallbackError: 'Failed to reset password',
  });
}

/** Confirms the email address with the token from the emailed link. Works signed in or not. */
export async function verifyEmail(token: string): Promise<void> {
  await apiRequest<unknown>('/api/auth/verify-email', {
    method: 'POST',
    body: { token },
    expectedStatus: 204,
    fallbackError: 'Failed to verify email',
  });
}

/** Emails a new verification link to the signed-in user. */
export async function resendVerificationEmail(): Promise<void> {
  await apiRequest<unknown>('/api/auth/resend-verification', {
    method: 'POST',
    expectedStatus: 202,
    fallbackError: 'Failed to send verification email',
  });
}

/** The signed-in user, fresh from the server (e.g. after the email was verified in another tab). */
export async function fetchCurrentUser(): Promise<User> {
  const data = await apiRequest<unknown>('/api/users/me', {
    fallbackError: 'Failed to load profile',
  });
  if (!isUserDto(data)) throw new Error('Unexpected response from server.');
  return userFromDto(data);
}
