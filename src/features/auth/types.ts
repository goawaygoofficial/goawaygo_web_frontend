import type { User } from '@/types';

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

/** One-time authorization code from Google's code client (popup). */
export interface GoogleCodeSignInRequest {
  code: string;
}

/** Only the email: the reset link is sent there. The new password is chosen on the page the link opens. */
export interface ForgotPasswordRequest {
  email: string;
}

/** From the emailed reset link: the link's token and the newly chosen password. */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/** Result of a successful sign-in. The access token itself stays inside `@/lib/session`. */
export interface AuthResult {
  user: User;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  /** Signing in cancelled the account's pending deletion. */
  restored: boolean;
}
