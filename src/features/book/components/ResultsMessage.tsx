import type { ReactNode } from 'react';
import { Button, Icon } from '@/components';
import styles from './ResultsMessage.module.css';

interface ResultsMessageProps {
  title: string;
  text?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

/** Loading, empty and error states inside a results page. */
export function ResultsMessage({ title, text, onRetry, children }: ResultsMessageProps) {
  return (
    <section className={styles.message} role={onRetry ? 'alert' : 'status'}>
      <Icon name="travel_explore" className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
      {children}
    </section>
  );
}
