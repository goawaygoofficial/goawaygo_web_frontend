import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import type { IconName } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { timeAgo } from '@/lib/timeAgo';
import { useUser } from '@/providers';
import { listNotifications, markAllRead } from '../services/notificationsService';
import type { Notification } from '../types';
import styles from './NotificationsPage.module.css';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; items: Notification[]; nextCursor: number | null }
  | { kind: 'error'; message: string };

/** The icon in place of a photo, for notifications without a person. */
const TYPE_ICONS: Partial<Record<Notification['type'], IconName>> = {
  trip_reminder: 'calendar_month',
  plan_opened: 'travel_explore',
  announcement: 'notifications',
};

/** Where tapping a notification goes; announcements go nowhere. */
function target(item: Notification): string | null {
  if (item.postId) return routes.wanderbookPost(item.postId);
  if (item.planId) return routes.plan(item.planId);
  if (item.type === 'follow_request') return routes.wanderbookRequests;
  if (item.actor) return routes.wanderbookProfile(item.actor.publicId);
  return null;
}

/**
 * The bell's list: Wanderbook activity, trip reminders, shared plans and announcements, newest first. Opening it
 * marks everything read (the new ones stay highlighted until the page is left).
 */
export function NotificationsPage() {
  const { user, status } = useUser();
  const goBack = useBack(routes.home);
  const userId = user?.id;
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${String(userId)}|${String(attempt)}`;
  const [result, setResult] = useState<{ requestKey: string; state: State } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (userId === undefined) return;
    const controller = new AbortController();
    listNotifications(undefined, controller.signal)
      .then((page) => {
        setResult({
          requestKey,
          state: { kind: 'ready', items: page.items, nextCursor: page.nextCursor },
        });
        if (page.unread > 0) {
          markAllRead().catch(() => {
            // Still unread; marked next time.
          });
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ requestKey, state: { kind: 'error', message: toErrorMessage(cause) } });
      });
    return () => {
      controller.abort();
    };
  }, [userId, requestKey]);

  const state: State = result?.requestKey === requestKey ? result.state : { kind: 'loading' };

  const loadMore = (cursor: number, items: Notification[]) => {
    setLoadingMore(true);
    listNotifications(cursor)
      .then((page) => {
        setResult({
          requestKey,
          state: { kind: 'ready', items: [...items, ...page.items], nextCursor: page.nextCursor },
        });
      })
      .catch((cause: unknown) => {
        setResult({ requestKey, state: { kind: 'error', message: toErrorMessage(cause) } });
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.titleRow}>
        <Icon name="notifications" className={styles.titleIcon} />
        <h1 className={styles.title}>Notifications</h1>
      </div>

      {status !== 'restoring' && !user ? (
        <section className={styles.panel}>
          <p>Sign in to see likes, comments, new followers and trip reminders.</p>
          <ButtonLink to={routes.profile}>Sign in</ButtonLink>
        </section>
      ) : state.kind === 'loading' ? (
        <p className={styles.status} role="status">
          Loading…
        </p>
      ) : state.kind === 'error' ? (
        <section className={styles.panel} role="alert">
          <p>{state.message}</p>
          <Button
            onClick={() => {
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </Button>
        </section>
      ) : state.items.length === 0 ? (
        <section className={styles.panel}>
          <Icon name="notifications" className={styles.panelIcon} />
          <p className={styles.panelTitle}>No notifications yet</p>
          <p>Likes, comments, new followers and trip reminders show up here.</p>
        </section>
      ) : (
        <>
          <ul className={styles.list}>
            {state.items.map((item) => (
              <li key={item.id}>
                <NotificationRow item={item} />
              </li>
            ))}
          </ul>
          {state.nextCursor !== null && (
            <div className={styles.more}>
              <Button
                size="sm"
                variant="outline"
                loading={loadingMore}
                onClick={() => {
                  if (state.nextCursor !== null) loadMore(state.nextCursor, state.items);
                }}
              >
                Show older
              </Button>
            </div>
          )}
        </>
      )}

      {user && (
        <p className={styles.footer}>
          <Link to={routes.notificationSettings}>Notification settings</Link>
        </p>
      )}
    </PageShell>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  const to = target(item);
  const content = (
    <>
      <span className={styles.avatar} aria-hidden="true">
        {item.actor?.photoUrl ? (
          <img src={item.actor.photoUrl} alt="" loading="lazy" />
        ) : (
          <Icon name={TYPE_ICONS[item.type] ?? 'person'} />
        )}
      </span>
      <span className={styles.body}>
        <span className={styles.message}>{item.message}</span>
        {item.detail && <span className={styles.detail}>{item.detail}</span>}
        <span className={styles.time}>{timeAgo(item.createdAt)}</span>
      </span>
      {!item.read && <span className={styles.dot} aria-label="New" />}
    </>
  );
  const className = `${styles.row} ${item.read ? '' : styles.unread}`;
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
