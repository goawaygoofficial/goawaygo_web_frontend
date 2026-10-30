import { Outlet } from 'react-router-dom';
import motionStyles from './PageMotion.module.css';
import styles from './OverlayLayout.module.css';
import { usePageMotion } from './usePageMotion';

/**
 * Screens that slide in over the shell (Flights, Stays, Rentals, Destination, New post, legal pages, ...). As in the
 * app, the tab bar is hidden while they are open. Opening slides in from the right; Back from the left.
 */
export function OverlayLayout() {
  const { key, motion } = usePageMotion();
  return (
    <div
      key={key}
      className={[styles.overlay, motionStyles.overlay, motionStyles[motion]]
        .filter(Boolean)
        .join(' ')}
    >
      <Outlet />
    </div>
  );
}
