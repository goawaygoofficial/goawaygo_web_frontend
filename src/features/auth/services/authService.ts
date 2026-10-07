import { ApiError, apiRequest } from '@/lib/apiClient';
import { isUserDto, userFromDto } from '@/types';
import type {
  AuthResponseDto,
  AuthResult,
  ForgotPasswordRequest,
  GoogleSignInRequest,
  SignInRequest,
  SignUpRequest,
} from '../types';

function toAuthResult(data: AuthResponseDto, fallbackError: string): AuthResult {
  if (!isUserDto(data.user)) throw new ApiError(fallbackError, 200);
  return { user: userFromDto(data.user), token: data.token };
}

/** Manual sign-up. The backend answers 201 and sends a verification email. */
export async function signUp(request: SignUpRequest): Promise<void> {
  await apiRequest<unknown>('/api/auth/signup', {
    method: 'POST',
    body: request,
    expectedStatus: 201,
    fallbackError: 'Signup failed',
  });
}

export async function signIn(request: SignInRequest): Promise<AuthResult> {
  const fallbackError = 'Signin failed';
  const data = await apiRequest<AuthResponseDto>('/api/auth/signin', {
    method: 'POST',
    body: request,
    expectedStatus: 200,
    fallbackError,
  });
  return toAuthResult(data, fallbackError);
}

export async function signInWithGoogle(request: GoogleSignInRequest): Promise<AuthResult> {
  const fallbackError = 'Google Signin failed';
  const data = await apiRequest<AuthResponseDto>('/api/auth/google-signin', {
    method: 'POST',
    body: request,
    expectedStatus: 200,
    fallbackError,
  });
  return toAuthResult(data, fallbackError);
}

export async function resetPassword(request: ForgotPasswordRequest): Promise<void> {
  await apiRequest<unknown>('/api/auth/forgot-password', {
    method: 'POST',
    body: request,
    expectedStatus: 200,
    fallbackError: 'Failed to request password reset',
  });
}
