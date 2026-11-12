/**
 * Minimal typings for the part of Google Identity Services (accounts.google.com/gsi/client) we use:
 * the OAuth 2.0 *code client*, which lets the website use its own button. The one-time code it returns is sent to
 * the backend (`/api/auth/google-signin/code`), which exchanges it with Google using the client secret.
 */

export interface GoogleCodeResponse {
  code?: string;
  scope?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface GoogleCodeClientError {
  /** `popup_closed`: the user closed it; `popup_failed_to_open`: blocked by the browser. */
  type: 'popup_closed' | 'popup_failed_to_open' | 'unknown';
}

export interface GoogleCodeClientConfig {
  client_id: string;
  scope: string;
  ux_mode: 'popup';
  /** Echoed back in the response, so it can be checked against what this page sent. */
  state?: string;
  select_account?: boolean;
  callback: (response: GoogleCodeResponse) => void;
  error_callback?: (error: GoogleCodeClientError) => void;
}

export interface GoogleCodeClient {
  /** Opens Google's popup. Must be called directly inside a click handler, or browsers block the popup. */
  requestCode: () => void;
}

export interface GoogleAccountsOAuth2 {
  initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleAccountsOAuth2 } };
  }
}
