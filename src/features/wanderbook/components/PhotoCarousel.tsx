import { useRef, useState } from 'react';
import type { Photo } from '../types';
import styles from './PhotoCarousel.module.css';

/** Frame shape from the first photo, kept between 4:5 (tall) and 1.91:1 (wide), like Instagram. */
function frameRatio(photo: Photo | undefined): number {
  if (!photo || photo.height === 0) return 1;
  return Math.min(1.91, Math.max(0.8, photo.width / photo.height));
}

/**
 * A post's photos, swiped or scrolled sideways. Photos are the originals and are never cropped: each fits the
 * frame whole, and "Full size" opens the original file.
 */
export function PhotoCarousel({ photos, label }: { photos: Photo[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={track}
        className={styles.track}
        style={{ aspectRatio: String(frameRatio(photos[0])) }}
        onScroll={(event) => {
          const element = event.currentTarget;
          setIndex(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
        }}
      >
        {photos.map((photo, position) => (
          <li
            key={photo.id}
            className={styles.slide}
            aria-roledescription="slide"
            aria-label={`${String(position + 1)} of ${String(photos.length)}`}
          >
            <img
              src={photo.url}
              alt=""
              width={photo.width}
              height={photo.height}
              loading={position === 0 ? 'eager' : 'lazy'}
              className={styles.image}
            />
          </li>
        ))}
      </ul>
      <div className={styles.bar}>
        {photos.length > 1 && (
          <span className={styles.dots} aria-hidden="true">
            {photos.map((photo, position) => (
              <span
                key={photo.id}
                className={[styles.dot, position === index && styles.dotActive]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </span>
        )}
        {photos.length > 1 && (
          <span className="visually-hidden" aria-live="polite">
            Photo {index + 1} of {photos.length}
          </span>
        )}
        {current && (
          <a href={current.url} target="_blank" rel="noopener noreferrer" className={styles.full}>
            Full size
          </a>
        )}
      </div>
    </section>
  );
}
