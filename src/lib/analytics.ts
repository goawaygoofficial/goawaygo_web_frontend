import type { PostHog } from 'posthog-js';
import { environment, scrubUrl } from './monitoring';

/**
 * Product analytics (PostHog, EU cloud), only after the visitor agrees. Until then nothing is loaded, stored or
 * sent; the choice itself is kept in localStorage (strictly necessary, no consent needed). Events are anonymous:
 * no person profiles, no identify, no autocapture, session recording or heatmaps, and tokens are cut out of URLs.
 * Only the events in `AnalyticsEvent` exist, so nothing personal can be sent by accident.
 */

interface PostHogSettings {
  /** Project API key (public, like the Sentry DSN). Empty: analytics off and no consent banner. */
  readonly key: string;
  /** EU cloud (Frankfurt). */
  readonly host: string;
}

// Typed as plain strings so the key can be filled in later without touching the code that checks it.
const POSTHOG: PostHogSettings = {
  key: 'phc_rvyFybyXHyGNrDa5yaWLkPEwSDn8JoPYU9CBnUZDrRL3',
  host: 'https://eu.i.posthog.com',
};

const CONSENT_KEY = 'goawaygo.analyticsConsent';
/** Where the choice was kept before the GoAwayGo rename; moved to CONSENT_KEY on first read. */
const LEGACY_CONSENT_KEY = 'goaway.analyticsConsent';

export type AnalyticsConsent = 'granted' | 'denied' | null;

/** The whole event list. Properties never contain names, emails, free text or IDs. */
export type AnalyticsEvent =
  | { name: 'sign_up_completed'; props: { method: 'email' } }
  | { name: 'sign_in_completed'; props: { method: 'email' | 'google' } }
  | { name: 'travel_category_opened'; props: { category: 'flights' | 'stays' | 'rentals' } }
  | { name: 'destination_searched'; props?: undefined }
  | { name: 'app_download_clicked'; props: { variant: 'arm64' | 'universal' } }
  | { name: 'beta_join_clicked'; props?: undefined };

const env = environment(window.location.hostname);

/** Analytics runs only on staging/production with a key; everywhere else there is nothing to ask about. */
export const analyticsAvailable = POSTHOG.key !== '' && env !== null;

// ---- consent store (read by React with useSyncExternalStore) ----

const listeners = new Set<() => void>();
let consent: AnalyticsConsent = readConsent();
/** True while the visitor reopened "Privacy choices" to change an earlier answer. */
let reviewing = false;

function readConsent(): AnalyticsConsent {
  try {
    let value = window.localStorage.getItem(CONSENT_KEY);
    const legacy = window.localStorage.getItem(LEGACY_CONSENT_KEY);
    if (legacy !== null) {
      value ??= legacy;
      window.localStorage.setItem(CONSENT_KEY, value);
      window.localStorage.removeItem(LEGACY_CONSENT_KEY);
    }
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getConsent(): AnalyticsConsent {
  return consent;
}

export function isReviewingConsent(): boolean {
  return reviewing;
}

/** Opens the consent banner again ("Privacy choices"). */
export function reviewConsent(): void {
  reviewing = true;
  emit();
}

export function setConsent(value: 'granted' | 'denied'): void {
  consent = value;
  reviewing = false;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Private mode: the choice lasts for this visit only.
  }
  if (value === 'granted') void startAnalytics();
  else stopAnalytics();
  emit();
}

// ---- PostHog ----

let client: PostHog | null = null;

const URL_PROPERTIES = [
  '$current_url',
  '$referrer',
  '$initial_referrer',
  '$prev_pageview_pathname',
];

async function startAnalytics(): Promise<void> {
  if (!analyticsAvailable || client) return;
  // Loaded on demand, so visitors who don't agree never download it.
  const { default: posthog } = await import('posthog-js');
  posthog.init(POSTHOG.key, {
    api_host: POSTHOG.host,
    persistence: 'localStorage',
    person_profiles: 'never',
    autocapture: false,
    capture_pageview: 'history_change',
    capture_pageleave: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false, // Sentry handles errors.
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    save_referrer: false,
    mask_personal_data_properties: true,
    before_send: (event) => {
      for (const key of URL_PROPERTIES) {
        const value: unknown = event.properties[key];
        if (typeof value === 'string') event.properties[key] = scrubUrl(value);
      }
      return event;
    },
  });
  posthog.register({ platform: 'web', environment: env });
  client = posthog;
}

function stopAnalytics(): void {
  if (client) {
    client.opt_out_capturing();
    client.reset();
    client = null;
  }
  // Remove anything PostHog stored on this device.
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('ph_')) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable: nothing was stored.
  }
}

/** Sends one event from the fixed list; does nothing without consent. */
export function track(event: AnalyticsEvent): void {
  client?.capture(event.name, event.props);
}

/** Starts analytics on load for visitors who agreed earlier. */
export function initAnalytics(): void {
  if (consent === 'granted') void startAnalytics();
}
