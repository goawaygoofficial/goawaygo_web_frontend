import type { User, UserDto } from '@/types';

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
  newPassword: string;
}

/** Body of a successful signin / google-signin response. */
export interface AuthResponseDto {
  user: UserDto;
  token: string;
}

export interface AuthResult {
  user: User;
  token: string;
}
