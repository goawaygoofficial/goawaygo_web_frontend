import { Outlet, useLocation } from 'react-router-dom';
import styles from './OverlayLayout.module.css';

/**
 * Screens that slide in from the right over the shell (Flights, Stays, Rentals, Destination,
 * User Profile). As in the app, the tab bar is hidden while they are open.
 */
export function OverlayLayout() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={styles.overlay}>
      <Outlet />
    </div>
  );
}
