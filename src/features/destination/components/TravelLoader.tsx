import { useEffect, useState } from 'react';
import { Icon } from '@/components';
import styles from './TravelLoader.module.css';

const MESSAGES = [
  'Packing your bags…',
  'Checking the entry rules…',
  'Finding the best views…',
  'Asking locals where to eat…',
  'Working out how to get around…',
  'Picking the best areas to stay…',
  'Almost ready for take-off…',
];

const MESSAGE_MS = 2600;

/**
 * Shown until the destination page is completely ready (the AI needs 10-20 s): a plane circling a turning
 * globe, with changing travel messages. Still with reduced motion; only the messages change.
 */
export function TravelLoader({ place }: { place: string }) {
  const [message, setMessage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessage((value) => Math.min(value + 1, MESSAGES.length - 1));
    }, MESSAGE_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.loader} role="status">
      <span className="visually-hidden">Getting {place} ready. This can take up to a minute.</span>
      <div className={styles.scene} aria-hidden="true">
        <svg viewBox="0 0 120 120" className={styles.globe}>
          <defs>
            <clipPath id="travel-loader-globe">
              <circle cx="60" cy="60" r="38" />
            </clipPath>
            {/* Light from the top left, so the flat circle reads as a ball. */}
            <radialGradient id="travel-loader-shine" cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.25" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="38" className={styles.sea} />
          <g clipPath="url(#travel-loader-globe)">
            {/* Two copies side by side; sliding them by one width looks like the globe turning. */}
            <g className={styles.land}>
              {[0, 76].map((offset) => (
                <g key={offset} transform={`translate(${String(offset)} 0)`}>
                  <path d="M30 40c6-6 16-6 20 0s-2 10-8 12-6 8-12 6-8-12 0-18z" />
                  <path d="M58 64c5-3 12-1 13 4s-3 11-8 13-9-2-9-7 0-8 4-10z" />
                  <path d="M76 36c4-2 10 0 10 4s-4 6-8 6-6-6-2-10z" />
                  <path d="M36 78c3-2 7 0 7 3s-3 5-6 4-4-5-1-7z" />
                </g>
              ))}
            </g>
            <circle cx="60" cy="60" r="38" fill="url(#travel-loader-shine)" />
          </g>
          <ellipse cx="60" cy="60" rx="52" ry="52" className={styles.orbit} />
        </svg>
        <div className={styles.planeTrack}>
          <span className={styles.plane}>
            <Icon name="flight" />
          </span>
        </div>
      </div>
      <p className={styles.place}>{place}</p>
      <p className={styles.message} key={message} aria-hidden="true">
        {MESSAGES[message]}
      </p>
    </div>
  );
}
