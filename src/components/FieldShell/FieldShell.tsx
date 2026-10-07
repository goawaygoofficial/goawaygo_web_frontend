import type { ReactNode } from 'react';
import styles from './FieldShell.module.css';

export type FieldTone = 'solid' | 'tinted' | 'accent';

interface FieldShellProps {
  tone: FieldTone;
  /** Leading decorative icon. */
  icon?: ReactNode;
  /** Small visible caption above the control, for fields where a placeholder isn't enough. */
  caption?: ReactNode;
  children: ReactNode;
  /** `compact` trims padding for fields that pack extra controls (counters). */
  density?: 'regular' | 'compact';
  className?: string;
}

/**
 * Pill-shaped container shared by every form control (text, date, counter, select).
 * Replaces the Flutter app's three per-feature input-field copies.
 */
export function FieldShell({
  tone,
  icon,
  caption,
  children,
  density = 'regular',
  className,
}: FieldShellProps) {
  return (
    <div
      className={[styles.shell, styles[tone], density === 'compact' && styles.compact, className]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.body}>
        {caption && <span className={styles.caption}>{caption}</span>}
        <div className={styles.control}>{children}</div>
      </div>
    </div>
  );
}
