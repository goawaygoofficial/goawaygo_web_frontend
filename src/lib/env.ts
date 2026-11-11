/**
 * Where the website runs, and its settings (MVP 2, 5.2). One build serves every environment, so the API address and
 * the environment's name come from the address the site is served at. Local development and pull request previews
 * use the build-time `VITE_*` values instead. Missing values never throw: features that need them degrade gracefully.
 */
function read(value: string | undefined): string {
  return (value ?? '').trim();
}

export interface Deployment {
  /** The name Sentry and PostHog record. */
  environment: string;
  /** Backend origin without a trailing slash. */
  apiBaseUrl: string;
}

const PRODUCTION: Deployment = {
  environment: 'production',
  apiBaseUrl: 'https://api.goawaygo.com',
};

const DEPLOYMENTS: Record<string, Deployment | undefined> = {
  'goawaygo.com': PRODUCTION,
  'www.goawaygo.com': PRODUCTION,
  'test.goawaygo.com': { environment: 'test', apiBaseUrl: 'https://api-test.goawaygo.com' },
  'dev.goawaygo.com': { environment: 'dev', apiBaseUrl: 'https://api-dev.goawaygo.com' },
  // Today's staging, until the three environments exist (5.3).
  'staging.goawaygo.com': { environment: 'staging', apiBaseUrl: 'https://api.goawaygo.com' },
};

/** The deployment served at `hostname`, or null (local development, previews). */
export function deploymentFor(hostname: string): Deployment | null {
  return DEPLOYMENTS[hostname] ?? null;
}

const deployment = deploymentFor(window.location.hostname);

/** Google OAuth web client ID (a public identifier, project goaway-483709): the same in every environment. */
const GOOGLE_CLIENT_ID =
  '1018541563002-sft2jld5f3n6lnenvt0pk8hknk7hfq9n.apps.googleusercontent.com';

export const env = {
  /** Backend origin without a trailing slash. Empty means "same origin". */
  apiBaseUrl: (deployment?.apiBaseUrl ?? read(import.meta.env.VITE_API_BASE_URL)).replace(
    /\/+$/,
    '',
  ),
  /** Google OAuth web client ID. Empty hides Google sign-in. */
  googleClientId: deployment ? GOOGLE_CLIENT_ID : read(import.meta.env.VITE_GOOGLE_CLIENT_ID),
} as const;
