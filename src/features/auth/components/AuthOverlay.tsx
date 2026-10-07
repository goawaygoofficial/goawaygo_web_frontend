import type { ReactNode } from 'react';
import { Logo, PageShell } from '@/components';
import styles from './AuthOverlay.module.css';

/** Full-screen panel that slides in from the right over the auth screen (Register, Forgot Password). */
export function AuthOverlay({ children }: { children: ReactNode }) {
  return (
    <div className={styles.overlay}>
      <PageShell className={styles.content}>
        <Logo size="lg" />
        {children}
      </PageShell>
    </div>
  );
}
