import type { ReactNode } from 'react';
import { Icon, PageHeader, PageShell } from '@/components';
import type { IconName } from '@/components';
import { useBack } from '@/hooks';
import styles from './ResultsLayout.module.css';

interface ResultsLayoutProps {
  icon: IconName;
  title: string;
  /** "Delhi to Mumbai", "Jaipur" */
  heading: string;
  /** Dates on the left of the info row. */
  dates: string;
  /** Travellers on the right of the info row ("1 passenger", "2 guests · 1 room"). */
  travellers?: string;
  /** The line under the info row: how to read the results ("Recent prices · may change until you book"). */
  note: string;
  /** Where Back goes when there is no history (the search form). */
  backTo: string;
  /** A pill floating at the bottom ("See all flights"). */
  floating?: ReactNode;
  children: ReactNode;
}

/**
 * The Flights / Stays / Car rentals results page (the founder's design): a title with its icon, what was searched,
 * the dates and travellers, then the result cards, an optional floating pill and the commission disclosure.
 */
export function ResultsLayout({
  icon,
  title,
  heading,
  dates,
  travellers,
  note,
  backTo,
  floating,
  children,
}: ResultsLayoutProps) {
  const goBack = useBack(backTo);
  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.titleRow}>
        <Icon name={icon} className={styles.titleIcon} />
        <h1 className={styles.title}>{title}</h1>
      </div>
      <p className={styles.heading}>{heading}</p>
      <div className={styles.infoRow}>
        <span className={styles.info}>
          <Icon name="calendar_today" />
          {dates}
        </span>
        {travellers && (
          <span className={styles.info}>
            <Icon name="person" />
            {travellers}
          </span>
        )}
      </div>
      <p className={styles.note}>{note}</p>
      <div className={styles.results}>{children}</div>
      <p className={styles.disclosure}>
        GoAwayGo may earn a commission when you book through these links. You pay the partner&apos;s
        price; bookings, payments and changes are handled by the partner.
      </p>
      {floating && <div className={styles.floating}>{floating}</div>}
    </PageShell>
  );
}
