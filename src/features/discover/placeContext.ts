import type { Place } from './types';

/** "Jaipur, Rajasthan, India" → "Rajasthan, India" (the name is shown separately). */
export function placeContext(place: Place): string {
  const { name, label, country } = place;
  const prefix = `${name}, `;
  if (label.startsWith(prefix)) return label.slice(prefix.length);
  return label === name ? (name === country ? '' : country) : label;
}
