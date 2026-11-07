/** "₹7,517" (whole units: fares are rounded by the partner). */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
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

/** "Mon, 7 Dec" */
export function formatDay(value: string): string {
  return calendarDay(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** "7–9 Dec", or "28 Apr – 5 May" across months. */
export function formatDateRange(start: string, end: string): string {
  const from = calendarDay(start);
  const to = calendarDay(end);
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const month = (date: Date) => date.toLocaleDateString('en-GB', { month: 'short' });
  return sameMonth
    ? `${String(from.getDate())}–${String(to.getDate())} ${month(to)}`
    : `${String(from.getDate())} ${month(from)} – ${String(to.getDate())} ${month(to)}`;
}

/** "December 2026" */
export function formatMonth(value: string): string {
  return calendarDay(value).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** The departure's local time, read straight from the timestamp ("2026-12-07T07:10:00+05:30" → "7:10 AM"). */
export function formatTime(iso: string): string {
  const [hours = 0, minutes = 0] = iso.slice(11, 16).split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12)}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** "2h 05m" */
export function formatDuration(minutes: number): string {
  return `${String(Math.floor(minutes / 60))}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export function stopsLabel(stops: number): string {
  if (stops === 0) return 'Nonstop';
  return stops === 1 ? '1 stop' : `${String(stops)} stops`;
}

export function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`;
}
