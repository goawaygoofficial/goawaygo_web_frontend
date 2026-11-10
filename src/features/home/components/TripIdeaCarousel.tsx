import { Icon } from '@/components';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks';
import type { TripIdea } from '@/features/discover';
import styles from './TripIdeaCarousel.module.css';
import { t } from '@/lib/i18n';

/** How much a card shrinks/fades per card-width away from the centre (same as the app's 0.3). */
const FALLOFF_PER_CARD = 0.3;

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

interface TripIdeaCarouselProps {
  ideas: readonly TripIdea[];
  label: string;
  renderCard: (idea: TripIdea) => ReactNode;
}

/**
 * Horizontally scrolling, snap-to-centre carousel. The centred card is full size; neighbours
 * scale and fade with distance, like the app's `StackedCardCarousel`.
 */
export function TripIdeaCarousel({ ideas, label, renderCard }: TripIdeaCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  const applyTransforms = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const centre = track.scrollLeft + track.clientWidth / 2;
    for (const item of Array.from(track.children) as HTMLElement[]) {
      const itemCentre = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(centre - itemCentre) / item.offsetWidth;
      const amount = reducedMotion ? 1 : Math.min(1, Math.max(0, 1 - distance * FALLOFF_PER_CARD));
      item.style.setProperty('--card-scale', String(easeOut(amount)));
      item.style.setProperty('--card-opacity', String(amount));
    }
  }, [reducedMotion]);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(applyTransforms);
  }, [applyTransforms]);

  // Start on the middle card so there are neighbours on both sides, like the app.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const middle = track?.children[Math.floor(ideas.length / 2)] as HTMLElement | undefined;
    if (!track || !middle) return;
    track.scrollLeft = middle.offsetLeft + middle.offsetWidth / 2 - track.clientWidth / 2;
    applyTransforms();
  }, [ideas.length, applyTransforms]);

  useEffect(() => {
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      cancelAnimationFrame(frameRef.current);
    };
  }, [scheduleUpdate]);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return;
    track.scrollBy({
      left: direction * first.offsetWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={label}>
      <ul ref={trackRef} className={styles.track} onScroll={scheduleUpdate}>
        {ideas.map((idea, index) => (
          <li
            key={idea.id}
            className={styles.slide}
            aria-roledescription="slide"
            aria-label={t('{0} of {1}', index + 1, ideas.length)}
          >
            {renderCard(idea)}
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          aria-label={t('Previous idea')}
          onClick={() => {
            step(-1);
          }}
        >
          <Icon name="arrow_back_ios_rounded" />
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label={t('Next idea')}
          onClick={() => {
            step(1);
          }}
        >
          <Icon name="arrow_forward_ios_rounded" />
        </button>
      </div>
    </section>
  );
}
