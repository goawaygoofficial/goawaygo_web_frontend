import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, PageHeader, PageShell } from '@/components';
import { sendAnnouncement } from '@/features/notifications';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './AdminAnnouncementsPage.module.css';

/**
 * Admins send a message to everyone (4.5): it appears in every bell and is pushed to the phones of people who left
 * "News from GoAwayGo" on. It can't be taken back, so it asks first.
 */
export function AdminAnnouncementsPage() {
  const { user, status } = useUser();
  const goBack = useBack(routes.home);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (status !== 'restoring' && user?.isAdmin !== true)
    return <Navigate to={routes.home} replace />;

  const send = () => {
    if (!title.trim() || !text.trim()) {
      setResult({ ok: false, message: 'Write a title and a message.' });
      return;
    }
    if (!window.confirm(`Send “${title.trim()}” to everyone? It can't be taken back.`)) return;
    setSending(true);
    setResult(null);
    sendAnnouncement(title.trim(), text.trim())
      .then((sent) => {
        setResult({ ok: true, message: `Sent to ${String(sent)} accounts.` });
        setTitle('');
        setText('');
      })
      .catch((cause: unknown) => {
        setResult({ ok: false, message: toErrorMessage(cause) });
      })
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.title}>Announcement</h1>
      </PageHeader>
      <p className={styles.intro}>
        Goes to every account&apos;s bell, and as a push to phones with &ldquo;News from
        GoAwayGo&rdquo; on.
      </p>
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input
            maxLength={120}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Message</span>
          <textarea
            maxLength={500}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
          <span className={styles.counter}>{text.length}/500</span>
        </label>
        {result && (
          <p className={result.ok ? styles.ok : styles.error} role={result.ok ? 'status' : 'alert'}>
            {result.message}
          </p>
        )}
        <Button type="submit" loading={sending}>
          Send to everyone
        </Button>
      </form>
      <p className={styles.links}>
        <Link to={routes.adminReports}>Wanderbook reports</Link>
      </p>
    </PageShell>
  );
}
