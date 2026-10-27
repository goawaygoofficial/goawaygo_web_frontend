import { useEffect, useState } from 'react';
import {
  PhotoSlider,
  getPhotosFor,
  getRecentSearches,
  readRecentSearches,
} from '@/features/discover';
import type { BannerSlide, PhotoSlide } from '@/features/discover';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './RecentSearchesBanner.module.css';

type BannerState = { kind: 'loading' } | { kind: 'ready'; slides: BannerSlide[] };

function toPhotoSlide(slide: BannerSlide): PhotoSlide {
  return {
    key: slide.place.id || slide.place.label,
    title: slide.place.name,
    subtitle: slide.spot !== slide.place.name ? slide.spot : slide.place.country,
    photo: slide.photo,
    to: routes.destination(slide.place.name, slide.place.id ? { id: slide.place.id } : undefined),
  };
}

/**
 * The home banner: the visitor's own last 5 searched places, each with a live photo of its top spot. Signed in,
 * the account keeps them; signed out, this browser does. No searches yet: "No recent searches".
 */
export function RecentSearchesBanner() {
  const { user, status } = useUser();
  const userId = user?.id ?? null;
  const [state, setState] = useState<BannerState>({ kind: 'loading' });

  useEffect(() => {
    if (status === 'restoring') return;
    const controller = new AbortController();
    const local = userId === null ? readRecentSearches() : [];
    const load =
      userId !== null
        ? getRecentSearches(controller.signal)
        : getPhotosFor(local, controller.signal);
    load
      .then((slides) => {
        setState({ kind: 'ready', slides });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // Photos unavailable: still show this device's places, on plain slides.
        setState({
          kind: 'ready',
          slides: local.map(({ place, spot }) => ({ place, spot, photo: null })),
        });
      });
    return () => {
      controller.abort();
    };
  }, [userId, status]);

  if (state.kind === 'loading') {
    return (
      <div className={styles.placeholder} aria-busy="true" aria-label="Loading recent searches" />
    );
  }
  if (state.slides.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No recent searches</p>
        <p className={styles.emptyText}>Places you search for will show here.</p>
      </div>
    );
  }
  return <PhotoSlider slides={state.slides.map(toPhotoSlide)} label="Your recent searches" />;
}
