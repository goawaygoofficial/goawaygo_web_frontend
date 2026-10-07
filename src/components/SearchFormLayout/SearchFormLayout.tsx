import type { SubmitEvent, ReactNode } from 'react';
import { useBack } from '@/hooks';
import { routes } from '@/lib/routes';
import { Button } from '../Button/Button';
import { PageHeader } from '../PageHeader/PageHeader';
import { PageShell } from '../PageShell/PageShell';
import styles from './SearchFormLayout.module.css';

interface SearchFormLayoutProps {
  title: string;
  imageSrc: string;
  onSubmit: () => void;
  children: ReactNode;
}

/**
 * Shared chrome for the Flights / Stays / Rentals booking forms:
 * logo + back arrow, title row with the category image, the form body and the orange Search button.
 */
export function SearchFormLayout({ title, imageSrc, onSubmit, children }: SearchFormLayoutProps) {
  const goBack = useBack(routes.home);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.titleRow}>
        <img src={imageSrc} alt="" className={styles.titleImage} />
        <h1 className={styles.title}>{title}</h1>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {children}
        <div className={styles.actions}>
          <Button type="submit">Search</Button>
        </div>
      </form>
    </PageShell>
  );
}
