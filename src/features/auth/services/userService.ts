import { ApiError, apiRequest } from '@/lib/apiClient';
import { isUserDto, userFromDto, userToDto } from '@/types';
import type { User } from '@/types';

/** Same key the Flutter app uses in SharedPreferences. */
const STORAGE_KEY = 'user';

export function saveStoredUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userToDto(user)));
  } catch {
    // Storage can be unavailable (private mode, quota). The session still works in memory.
  }
}

export function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUserDto(parsed) ? userFromDto(parsed) : null;
  } catch {
    return null;
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

type UserVerification = 'valid' | 'invalid' | 'unreachable';

/**
 * Checks a restored user against `GET /api/auth/users/{id}`.
 * A 4xx or an id mismatch means the stored user is no longer valid; a network
 * failure or 5xx is reported as `unreachable` so a backend blip doesn't sign people out.
 */
export async function verifyUser(userId: number, signal?: AbortSignal): Promise<UserVerification> {
  try {
    const data = await apiRequest<unknown>(`/api/auth/users/${userId}`, {
      fallbackError: 'Could not verify user',
      signal,
    });
    return isUserDto(data) && data.id === userId ? 'valid' : 'invalid';
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return 'invalid';
    if (error instanceof ApiError) return 'unreachable';
    throw error;
  }
}
