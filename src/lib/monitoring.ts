import * as Sentry from '@sentry/react';
import type { Breadcrumb, ErrorEvent } from '@sentry/react';

/** Sentry project goaway-web (EU region). A DSN is a public identifier, not a secret. */
const SENTRY_DSN =
  'https://9b000b46dca318a534af1809fad6f4d4@o4512273190813696.ingest.de.sentry.io/4512273682923600';

/** Which deployment this is, by address. Local development and PR previews send nothing. */
function environment(hostname: string): string | null {
  if (hostname === 'staging.goawaygo.com') return 'staging';
  if (hostname === 'goawaygo.com' || hostname === 'www.goawaygo.com') return 'production';
  return null;
}

/** Single-use tokens and OAuth values in URLs (emailed links, Google's popup) never leave the browser. */
const SENSITIVE_QUERY = /([?&#](?:token|code|state|access_token)=)[^&#\s]*/gi;

export function scrubUrl(url: string): string {
  return url.replace(SENSITIVE_QUERY, '$1[Filtered]');
}

function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.url) event.request.url = scrubUrl(event.request.url);
  return event;
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const data = breadcrumb.data;
  if (data) {
    for (const key of ['url', 'from', 'to']) {
      const value: unknown = data[key];
      if (typeof value === 'string') data[key] = scrubUrl(value);
    }
  }
  if (breadcrumb.message) breadcrumb.message = scrubUrl(breadcrumb.message);
  return breadcrumb;
}

/**
 * Error tracking for the deployed website: crashes and unhandled errors go to Sentry with the release (commit) and
 * environment. No personal data (see `dataCollection`); tokens are also cut out of URLs as a second safeguard.
 */
export function initMonitoring(): void {
  const env = environment(window.location.hostname);
  if (!env) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: env,
    release: `goaway-web@${__APP_RELEASE__}`,
    // Collect no personal data: no user details, cookies, headers, request/response bodies or query strings.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    // Don't add tracing headers to API calls: the API only accepts a few request headers (CORS).
    tracePropagationTargets: [],
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}
