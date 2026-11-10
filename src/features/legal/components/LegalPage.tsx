import type { ReactNode } from 'react';
import { PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { legal } from '@/lib/legal';
import { routes } from '@/lib/routes';
import styles from './LegalPage.module.css';

interface LegalPageProps {
  title: string;
  /** One or two sentences under the title: what this page is, in plain words. */
  summary: ReactNode;
  children: ReactNode;
}

/** Reading layout shared by the Privacy Policy, Terms of Use and Delete-my-data pages. */
export function LegalPage({ title, summary, children }: LegalPageProps) {
  const goBack = useBack(routes.home);

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <article className={styles.article}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated {legal.lastUpdated}</p>
        <p className={styles.summary}>{summary}</p>
        {children}
      </article>
    </PageShell>
  );
}

/** A numbered section; `id` makes it linkable (e.g. /privacy#your-rights). */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={styles.section}>
      <h2 id={`${id}-heading`} className={styles.heading}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** `mailto:` link for one of the contact addresses. */
export function MailLink({ address, subject }: { address: string; subject?: string }) {
  const href = subject
    ? `mailto:${address}?subject=${encodeURIComponent(subject)}`
    : `mailto:${address}`;
  return (
    <a className={styles.link} href={href}>
      {address}
    </a>
  );
}
