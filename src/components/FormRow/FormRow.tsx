import type { ReactNode } from 'react';
import styles from './FormRow.module.css';

/** Lays fields out side by side, wrapping onto new lines when there isn't room. */
export function FormRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
