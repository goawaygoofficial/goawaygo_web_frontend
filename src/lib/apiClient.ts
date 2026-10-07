import { env } from './env';

const NETWORK_ERROR_MESSAGE = 'Unable to connect to server.';

/** Error thrown for any failed API call. `status` is 0 when the server could not be reached. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
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

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Performs a JSON request against the Goaway backend and returns the parsed body.
 * The caller supplies the expected response type; validate/map it at the service boundary.
 */
export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = 'GET', body, expectedStatus, fallbackError, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const data = await parseBody(response);
  const ok = expectedStatus === undefined ? response.ok : response.status === expectedStatus;
  if (!ok) {
    throw new ApiError(extractErrorMessage(data, fallbackError), response.status);
  }
  return data as T;
}

/** Turns any thrown value into a message that is safe to show to the user. */
export function toErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return fallback;
}
