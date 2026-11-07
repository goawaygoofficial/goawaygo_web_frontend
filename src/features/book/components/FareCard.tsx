import { formatDay, formatDuration, formatPrice, formatTime, stopsLabel } from '../format';
import type { Fare } from '../types';
import styles from './BookCards.module.css';

interface FareCardProps {
  fare: Fare;
  currency: string;
  roundTrip: boolean;
  onOpen: () => void;
}

/**
 * One fare (the founder's flight card): price and airline on the light side, departure, route, stops and flying
 * time on the dark side. Opens the fare on the partner's site in a new tab.
 */
export function FareCard({ fare, currency, roundTrip, onOpen }: FareCardProps) {
  const stops =
    roundTrip && fare.returnStops !== null
      ? `${stopsLabel(fare.stops)} · back ${stopsLabel(fare.returnStops).toLowerCase()}`
      : stopsLabel(fare.stops);
  return (
    <a
      className={styles.card}
      href={fare.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onOpen}
    >
      <span className={styles.side}>
        <span className={styles.price}>{formatPrice(fare.price, currency)}</span>
        <span className={styles.small}>{roundTrip ? 'Round trip' : 'One way'} per passenger</span>
        <span className={styles.airline}>
          <img
            className={styles.airlineLogo}
            src={`https://pics.avs.io/64/64/${encodeURIComponent(fare.airline)}.png`}
            alt=""
            loading="lazy"
          />
          {fare.airlineName || fare.airline}
        </span>
      </span>
      <span className={styles.main}>
        <span className={styles.title}>
          {formatTime(fare.departAt)} · {formatDay(fare.departAt)}
        </span>
        <span className={styles.line}>
          {fare.origin} → {fare.destination}
          {roundTrip && fare.returnAt ? ` · back ${formatDay(fare.returnAt)}` : ''}
        </span>
        <span className={styles.line}>
          {!roundTrip && fare.durationMinutes ? `${formatDuration(fare.durationMinutes)} · ` : ''}
          {stops}
        </span>
      </span>
    </a>
  );
}
