/** "3 min", "5 h", "2 d", or the date for older things. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${String(Math.floor(seconds / 60))} min`;
  if (seconds < 86400) return `${String(Math.floor(seconds / 3600))} h`;
  if (seconds < 7 * 86400) return `${String(Math.floor(seconds / 86400))} d`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
