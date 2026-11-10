import { getLocale, t } from '@/lib/i18n';

/** "₹7,517" in the visitor's locale (whole units: fares are rounded by the partner). */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/** A `YYYY-MM-DD` (or the date part of an ISO timestamp) as a calendar day, without time-zone shifts. */
function calendarDay(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

/** "Mon, 7 Dec" (in the visitor's locale) */
export function formatDay(value: string): string {
  return calendarDay(value).toLocaleDateString(getLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** "7–9 Dec", or "28 Apr – 5 May" across months (in the visitor's locale). */
export function formatDateRange(start: string, end: string): string {
  return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short' }).formatRange(
    calendarDay(start),
    calendarDay(end),
  );
}

/** "December 2026" */
export function formatMonth(value: string): string {
  return calendarDay(value).toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' });
}

/**
 * The departure's local time, read straight from the timestamp ("2026-12-07T07:10:00+05:30" → "7:10 AM", or
 * "07:10" where the locale uses a 24-hour clock).
 */
export function formatTime(iso: string): string {
  const [hours = 0, minutes = 0] = iso.slice(11, 16).split(':').map(Number);
  return new Intl.DateTimeFormat(getLocale(), {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

/** "2h 05m" */
export function formatDuration(minutes: number): string {
  return t('{0}h {1}m', Math.floor(minutes / 60), String(minutes % 60).padStart(2, '0'));
}

export function stopsLabel(stops: number): string {
  if (stops === 0) return t('Nonstop');
  return stops === 1 ? t('1 stop') : t('{0} stops', stops);
}

/** "1 day", "3 days" (and the same for passengers, guests and rooms), translated. */
export function plural(count: number, word: 'day' | 'passenger' | 'guest' | 'room'): string {
  return count === 1 ? t(`1 ${word}`) : t(`{0} ${word}s`, count);
}
