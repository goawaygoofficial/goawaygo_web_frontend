/**
 * Facts shared by the legal pages (Privacy Policy, Terms of Use, Delete my data). Change them here, then update
 * `lastUpdated`. The app links to these pages on the website, so there is one copy of each text.
 */
export const legal = {
  /** Shown as "Last updated" on every legal page. Change it whenever a page's meaning changes. */
  lastUpdated: '28 October 2026',
  /** Privacy requests, data deletion and complaints, for every country. Forwards to the team inbox. */
  privacyEmail: 'privacy@goawaygo.com',
  /** Everything else. */
  supportEmail: 'support@goawaygo.com',
  /** Days within which we answer a privacy request or grievance. */
  responseDays: 30,
} as const;
