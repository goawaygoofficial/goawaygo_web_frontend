import type { ReactNode } from 'react';
import { useUser } from '@/providers';
import styles from './SessionGate.module.css';

/**
 * Holds rendering until the session has been restored from the refresh cookie (one request on page load), so
 * every page knows from its first render whether someone is signed in. Without it, a signed-in user opening a
 * page directly would briefly look signed out and could be redirected away.
 * The placeholder uses the splash colour, so on `/` it blends into the splash screen.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const { status } = useUser();
  if (status === 'restoring') {
    return <main className={styles.restoring} aria-busy="true" aria-label="Loading" />;
  }
  return children;
}
