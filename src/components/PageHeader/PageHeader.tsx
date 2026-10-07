import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '../Logo/Logo';
import { NotificationButton } from '../NotificationButton/NotificationButton';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  /** Centre slot, e.g. a page title. */
  children?: ReactNode;
  /** Shows a back arrow on the right that calls this. */
  onBack?: () => void;
  backLabel?: string;
  /** Shows the notification bell on the right. */
  showNotifications?: boolean;
}

/** Logo row used at the top of nearly every screen. */
export function PageHeader({
  children,
  onBack,
  backLabel = 'Back',
  showNotifications = false,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Logo size="md" />
      <div className={styles.centre}>{children}</div>
      <div className={styles.actions}>
        {showNotifications && <NotificationButton />}
        {onBack && (
          <button type="button" className={styles.back} aria-label={backLabel} onClick={onBack}>
            <ChevronLeft aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
