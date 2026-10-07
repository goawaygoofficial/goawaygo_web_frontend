import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  /** `content` is a reading column; `wide` lets pages use multi-column layouts on desktop. */
  width?: 'content' | 'wide';
  className?: string;
}

/** Centred, padded page column on the brand-blue background. */
export function PageShell({ children, width = 'content', className }: PageShellProps) {
  return (
    <main className={[styles.shell, styles[width], className].filter(Boolean).join(' ')}>
      {children}
    </main>
  );
}
