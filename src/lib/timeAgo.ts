import { getLocale, t } from './i18n';

/** "3 min", "5 h", "2 d", or the date for older things (translated, in the visitor's locale). */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return t('now');
  if (seconds < 3600) return t('{0} min', Math.floor(seconds / 60));
  if (seconds < 86400) return t('{0} h', Math.floor(seconds / 3600));
  if (seconds < 7 * 86400) return t('{0} d', Math.floor(seconds / 86400));
  return new Date(iso).toLocaleDateString(getLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
