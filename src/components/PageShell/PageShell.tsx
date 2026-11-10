import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  /** `content` is a reading column; `wide` lets pages use multi-column layouts on desktop. */
  width?: 'content' | 'wide';
  className?: string;
  /** `div` while a panel over the page (Register, Forgot Password) is the main content, so there is one main. */
  as?: 'main' | 'div';
}

/** Centred, padded page column on the brand-blue background. */
export function PageShell({
  children,
  width = 'content',
  className,
  as: Tag = 'main',
}: PageShellProps) {
  return (
    <Tag className={[styles.shell, styles[width], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
