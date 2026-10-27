import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components';
import { usePrefersReducedMotion } from '@/hooks';
import type { Photo } from '../types';
import styles from './PhotoSlider.module.css';

const AUTO_ADVANCE_MS = 5000;

export interface PhotoSlide {
  key: string;
  title: string;
  subtitle?: string;
  /** Null: the slide shows a brand gradient instead. */
  photo: Photo | null;
  /** Opens this page when the slide is clicked. */
  to?: string;
}

interface PhotoSliderProps {
  slides: readonly PhotoSlide[];
  /** Accessible name of the carousel. */
  label: string;
  className?: string;
}

/**
 * Cross-fading photo banner: the photo's place name on it and its credit (photographer and licence, which
 * Wikimedia and Unsplash require) in the corner. Moves on every 5 seconds until the visitor pauses it, hovers it
 * or uses its controls; never moves on its own with reduced motion.
 */
export function PhotoSlider({ slides, label, className }: PhotoSliderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = slides.length;
  const current = Math.min(index, Math.max(0, count - 1));
  const playing = !paused && !hovered && !reducedMotion && count > 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [playing, count]);

  if (count === 0) return null;

  const go = (next: number) => {
    setPaused(true);
    setIndex((next + count) % count);
  };

  return (
    <section
      className={[styles.slider, className].filter(Boolean).join(' ')}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <ul className={styles.frame} aria-live={playing ? 'off' : 'polite'}>
        {slides.map((slide, position) => {
          const active = position === current;
          return (
            <li
              key={slide.key}
              className={[styles.slide, active && styles.active].filter(Boolean).join(' ')}
              aria-roledescription="slide"
              aria-label={`${String(position + 1)} of ${String(count)}: ${slide.title}`}
              aria-hidden={!active}
            >
              {slide.photo ? (
                <img
                  src={slide.photo.url}
                  alt={slide.title}
                  className={styles.image}
                  loading={position === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.noPhoto} />
              )}
              <div className={styles.caption}>
                <span className={styles.title}>{slide.title}</span>
                {slide.subtitle && <span className={styles.subtitle}>{slide.subtitle}</span>}
              </div>
              {slide.to && (
                <Link
                  to={slide.to}
                  className={styles.open}
                  tabIndex={active ? 0 : -1}
                  aria-label={`Open ${slide.subtitle ?? slide.title}`}
                />
              )}
              {slide.photo && (
                <a
                  href={slide.photo.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.credit}
                  tabIndex={active ? 0 : -1}
                >
                  {slide.photo.credit}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {count > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            aria-label="Previous photo"
            onClick={() => {
              go(current - 1);
            }}
          >
            <Icon name="arrow_back_ios_rounded" />
          </button>
          <div className={styles.dots}>
            {slides.map((slide, position) => (
              <button
                key={slide.key}
                type="button"
                className={[styles.dot, position === current && styles.dotActive]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Show photo ${String(position + 1)}: ${slide.title}`}
                aria-current={position === current}
                onClick={() => {
                  go(position);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.control}
            aria-label="Next photo"
            onClick={() => {
              go(current + 1);
            }}
          >
            <Icon name="arrow_forward_ios_rounded" />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              className={styles.control}
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => {
                setPaused((value) => !value);
              }}
            >
              <Icon name={paused ? 'play_arrow_rounded' : 'pause_rounded'} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
