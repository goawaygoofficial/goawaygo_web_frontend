import { ApiError } from './apiError';
import { env } from './env';
import { endSession, getAccessToken, refreshSession } from './session';

export { ApiError } from './apiError';

const NETWORK_ERROR_MESSAGE = 'Unable to connect to server.';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** A file upload (multipart); sent instead of a JSON `body`. */
  form?: FormData;
  /** Status that counts as success. Defaults to any 2xx. */
  expectedStatus?: number;
  /** Message used when the server gives no `message` / `error` in its error body. */
  fallbackError: string;
  signal?: AbortSignal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** The single place error messages are pulled out of a response body: message → error → fallback. */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (isRecord(body)) {
    const { message, error } = body;
    if (typeof message === 'string' && message.length > 0) return message;
    if (typeof error === 'string' && error.length > 0) return error;
  }
  return fallback;
}

function extractErrorCode(body: unknown): string | null {
  return isRecord(body) && typeof body.error === 'string' ? body.error : null;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function send(
  path: string,
  options: RequestOptions,
  token: string | null,
): Promise<Response> {
  const { method = 'GET', body, form, signal } = options;
  const headers: Record<string, string> = {};
  // A multipart body sets its own Content-Type (with the boundary).
  if (body !== undefined && form === undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      // Sends the HttpOnly refresh cookie to /api/auth/*; the browser never exposes it to this code.
      credentials: 'include',
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }
}

/**
 * Performs a JSON request against the GoAwayGo backend and returns the parsed body.
 * Sends the access token when signed in. If the server answers 401 to an authenticated request (the 20-minute
 * token expired), it refreshes the session once and retries; if that fails the user is signed out.
 * The caller supplies the expected response type; validate/map it at the service boundary.
 */
export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const token = getAccessToken();
  let response = await send(path, options, token);

  if (response.status === 401 && token !== null) {
    const refreshed = await refreshSession().catch(() => null);
    if (refreshed) {
      response = await send(path, options, refreshed.accessToken);
    } else {
      endSession();
    }
  }

  const data = await parseBody(response);
  const ok =
    options.expectedStatus === undefined ? response.ok : response.status === options.expectedStatus;
  if (!ok) {
    throw new ApiError(
      extractErrorMessage(data, options.fallbackError),
      response.status,
      extractErrorCode(data),
    );
  }
  return data as T;
}

/** Turns any thrown value into a message that is safe to show to the user. */
export function toErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return fallback;
}
