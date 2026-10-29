import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { apiRequest, toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './AdminReportsPage.module.css';

/** An open report as the backend's admin API returns it. */
interface Report {
  id: number;
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  details: string;
  createdAt: string;
  reporterName: string;
  reportsOnTarget: number;
  target: {
    exists: boolean;
    publicId?: string;
    author?: string;
    caption?: string;
    text?: string;
    bio?: string;
    photos?: string[];
  };
}

const getReports = (signal?: AbortSignal) =>
  apiRequest<Report[]>('/api/admin/wanderbook/reports', {
    fallbackError: 'Could not load reports.',
    signal,
  });

const resolve = (id: number, action: 'remove' | 'dismiss') =>
  apiRequest<unknown>(`/api/admin/wanderbook/reports/${String(id)}/resolve`, {
    method: 'POST',
    body: { action },
    expectedStatus: 204,
    fallbackError: 'Could not resolve the report.',
  });

/**
 * Admins review Wanderbook reports (new ones are also emailed to the team): remove the post or comment, or dismiss.
 * Resolving one report closes every open report on the same thing.
 */
export function AdminReportsPage() {
  const { user, status } = useUser();
  const goBack = useBack(routes.home);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    getReports(controller.signal).then(setReports, (cause: unknown) => {
      if (!controller.signal.aborted) setError(toErrorMessage(cause));
    });
    return () => {
      controller.abort();
    };
  }, [isAdmin]);

  if (status !== 'restoring' && !isAdmin) return <Navigate to={routes.home} replace />;

  const act = (report: Report, action: 'remove' | 'dismiss') => {
    if (
      action === 'remove' &&
      !window.confirm(`Delete this ${report.targetType}? This can't be undone.`)
    )
      return;
    // Every open report on the same thing closes with it, so reload the list.
    resolve(report.id, action)
      .then(() => getReports())
      .then(setReports)
      .catch((cause: unknown) => {
        setError(toErrorMessage(cause));
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.title}>Wanderbook reports</h1>
      </PageHeader>
      {error && <p className={styles.error}>{error}</p>}
      {!reports && !error && <p className={styles.status}>Loading…</p>}
      {reports?.length === 0 && <p className={styles.status}>No open reports.</p>}
      <ul className={styles.list}>
        {reports?.map((report) => (
          <li key={report.id} className={styles.report}>
            <p className={styles.meta}>
              <strong>{report.targetType}</strong> · {report.reason.replace('_', ' ')} · by{' '}
              {report.reporterName} · {new Date(report.createdAt).toLocaleString()}
              {report.reportsOnTarget > 1 && ` · ${String(report.reportsOnTarget)} reports`}
            </p>
            {report.details && <p className={styles.details}>“{report.details}”</p>}
            {!report.target.exists ? (
              <p className={styles.status}>Already deleted.</p>
            ) : (
              <div className={styles.target}>
                <p>
                  <strong>{report.target.author}</strong>{' '}
                  {report.target.caption ?? report.target.text ?? report.target.bio}
                </p>
                {report.target.photos && (
                  <div className={styles.photos}>
                    {report.target.photos.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
                {report.target.publicId && (
                  <Link
                    to={
                      report.targetType === 'post'
                        ? routes.wanderbookPost(report.target.publicId)
                        : routes.wanderbookProfile(report.target.publicId)
                    }
                  >
                    Open
                  </Link>
                )}
              </div>
            )}
            <div className={styles.buttons}>
              {report.targetType !== 'user' && report.target.exists && (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => {
                    act(report, 'remove');
                  }}
                >
                  Remove {report.targetType}
                </button>
              )}
              <button
                type="button"
                className={styles.dismiss}
                onClick={() => {
                  act(report, 'dismiss');
                }}
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
