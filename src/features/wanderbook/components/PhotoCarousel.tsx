import { useRef, useState } from 'react';
import type { Photo } from '../types';
import styles from './PhotoCarousel.module.css';
import { Icon } from '@/components';
import { t } from '@/lib/i18n';

/** Frame shape from the first photo, kept between 4:5 (tall) and 1.91:1 (wide), like Instagram. */
function frameRatio(photo: Photo | undefined): number {
  if (!photo || photo.height === 0) return 1;
  return Math.min(1.91, Math.max(0.8, photo.width / photo.height));
}

/**
 * A post's photos, swiped or scrolled sideways. Photos are the originals and are never cropped: each fits the
 * frame whole, and "Full size" opens the original file. Previous / Next buttons move without swiping (WCAG 2.5.7).
 */
export function PhotoCarousel({
  photos,
  label,
  morphName,
}: {
  photos: Photo[];
  label: string;
  /** view-transition-name of the first photo, so it morphs to and from the grid tile (MorphLink). */
  morphName?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];

  const step = (direction: 1 | -1) => {
    const element = track.current;
    if (!element) return;
    // Right to left, the next photo is to the left.
    const sign = getComputedStyle(element).direction === 'rtl' ? -1 : 1;
    element.scrollBy({ left: direction * sign * element.clientWidth, behavior: 'smooth' });
  };

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={track}
        className={styles.track}
        style={{ aspectRatio: String(frameRatio(photos[0])) }}
        onScroll={(event) => {
          const element = event.currentTarget;
          setIndex(Math.round(Math.abs(element.scrollLeft) / Math.max(1, element.clientWidth)));
        }}
      >
        {photos.map((photo, position) => (
          <li
            key={photo.id}
            className={styles.slide}
            aria-roledescription="slide"
            aria-label={t('{0} of {1}', position + 1, photos.length)}
          >
            <img
              src={photo.url}
              alt=""
              width={photo.width}
              height={photo.height}
              loading={position === 0 ? 'eager' : 'lazy'}
              style={position === 0 && morphName ? { viewTransitionName: morphName } : undefined}
              className={styles.image}
            />
          </li>
        ))}
      </ul>
      <div className={styles.bar}>
        {photos.length > 1 && (
          <button
            type="button"
            className={styles.step}
            aria-label={t('Previous photo')}
            disabled={index === 0}
            onClick={() => {
              step(-1);
            }}
          >
            <Icon name="arrow_back_ios_rounded" />
          </button>
        )}
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
          <button
            type="button"
            className={styles.step}
            aria-label={t('Next photo')}
            disabled={index === photos.length - 1}
            onClick={() => {
              step(1);
            }}
          >
            <Icon name="arrow_forward_ios_rounded" />
          </button>
        )}
        {photos.length > 1 && (
          <span className="visually-hidden" aria-live="polite">
            {t('Photo {0} of {1}', index + 1, photos.length)}
          </span>
        )}
        {current && (
          <a href={current.url} target="_blank" rel="noopener noreferrer" className={styles.full}>
            {t('Full size')}
          </a>
        )}
      </div>
    </section>
  );
}
