/**
 * Error thrown for any failed API call. `status` is 0 when the server could not be reached.
 * `code` is the backend's machine-readable `error` value (e.g. `invalid_credentials`) when it sent one.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
