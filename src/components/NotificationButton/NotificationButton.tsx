import { Bell } from 'lucide-react';
import styles from './NotificationButton.module.css';

/**
 * The bell shown in the app's headers. Notifications don't exist yet (the app's handler is
 * empty), so it is rendered visibly disabled instead of as a dead button.
 */
export function NotificationButton() {
  return (
    <button
      type="button"
      className={styles.bell}
      disabled
      aria-label="Notifications (coming soon)"
      title="Notifications — coming soon"
    >
      <Bell aria-hidden="true" fill="currentColor" />
    </button>
  );
}
