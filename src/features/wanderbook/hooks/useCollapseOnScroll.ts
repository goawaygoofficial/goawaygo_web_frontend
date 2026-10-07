import { useEffect } from 'react';
import type { RefObject } from 'react';
import { usePrefersReducedMotion } from '@/hooks';

/**
 * Writes `--collapse` (1 = fully visible → 0 = scrolled away, eased) onto the element as the
 * window scrolls past it. CSS turns it into the scale / fade / translate of the app's sliver header.
 */
export function useCollapseOnScroll(ref: RefObject<HTMLElement | null>): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reducedMotion) {
      element.style.setProperty('--collapse', '1');
      return;
    }

    let frame = 0;
    const update = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / element.offsetHeight));
      const remaining = 1 - progress;
      const eased = 1 - (1 - remaining) * (1 - remaining);
      element.style.setProperty('--collapse', eased.toFixed(3));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref, reducedMotion]);
}
