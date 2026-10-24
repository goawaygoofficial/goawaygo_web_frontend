import { ApiError } from './apiError';
import { env } from './env';
import { isUserDto } from '@/types';
import type { UserDto } from '@/types';

/**
 * The browser session.
 *
 * - The **access token** (20 min) lives only in this module's memory: never in localStorage, where any script
 *   injected into the page could read it. A page reload simply restores it with a refresh.
 * - The **refresh token** (30 days) is an HttpOnly cookie that only the backend can read; the browser sends it
 *   to `/api/auth/*` because requests use `credentials: 'include'`.
 * - Refresh tokens rotate on every use and the backend treats reuse of an old one as theft (it signs the user
 *   out). So refreshes must never overlap: concurrent callers in a tab share one request, and the Web Locks API
 *   serialises tabs, so a second tab refreshes with the cookie the first one just received.
 */

/** Body of a successful sign-in / refresh. */
export interface SessionDto {
  user: UserDto;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

type SessionListener = (user: UserDto | null) => void;

const REFRESH_LOCK = 'goawaygo-auth-refresh';

let accessToken: string | null = null;
let inFlightRefresh: Promise<SessionDto | null> | null = null;
const listeners = new Set<SessionListener>();

export function getAccessToken(): string | null {
  return accessToken;
}

/** Validates a sign-in / refresh body, stores its access token and notifies listeners. */
export function startSession(data: unknown): SessionDto {
  if (!isSessionDto(data)) throw new ApiError('Unexpected response from the server.', 200);
  accessToken = data.accessToken;
  notify(data.user);
  return data;
}

export function endSession(): void {
  accessToken = null;
  notify(null);
}

/** Subscribe to sign-in, background refresh and expiry. Returns the unsubscribe function. */
export function onSessionChange(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Exchanges the refresh cookie for a new access token. Resolves `null` when there is no valid session
 * (signed out). Rejects with `ApiError` status 0 when the server is unreachable, so a network blip does not
 * sign anyone out.
 */
export function refreshSession(): Promise<SessionDto | null> {
  inFlightRefresh ??= withCrossTabLock(doRefresh).finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

async function doRefresh(): Promise<SessionDto | null> {
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Unable to connect to server.', 0);
  }
  if (response.status === 401) {
    endSession();
    return null;
  }
  if (!response.ok) throw new ApiError('Could not restore your session.', response.status);
  return startSession(await response.json());
}

async function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  // Web Locks are in all current browsers; without them we still single-flight within this tab.
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    return await navigator.locks.request(REFRESH_LOCK, task);
  }
  return await task();
}

function notify(user: UserDto | null): void {
  for (const listener of listeners) listener(user);
}

function isSessionDto(value: unknown): value is SessionDto {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isUserDto(candidate.user) &&
    typeof candidate.accessToken === 'string' &&
    candidate.accessToken.length > 0 &&
    typeof candidate.expiresIn === 'number'
  );
}
