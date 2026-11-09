import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import recentlyViewedIcon from '@/assets/icons/recently_viewed.png';
import { Button, PageHeader, PageShell } from '@/components';
import {
  forgetRecentSearches,
  MAX_REMEMBERED_PLACES,
  readRecentSearches,
} from '@/features/discover';
import { forgetRecentPlans, readRecentPlans } from '@/features/plans';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { timeAgo } from '@/lib/timeAgo';
import { useDialog, useUser } from '@/providers';
import { clearRecentlyViewed, getRecentlyViewed } from '../services/accountService';
import type { RecentlyViewed } from '../types';
import styles from './RecentlyViewedPage.module.css';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; viewed: RecentlyViewed }
  | { kind: 'error'; message: string };

/** What this browser remembers for a signed-out visitor (shared plans only: they have no plans of their own). */
function localViewed(): RecentlyViewed {
  return {
    places: readRecentSearches(MAX_REMEMBERED_PLACES).map((entry) => ({
      place: entry.place,
      viewedAt: entry.viewedAt ?? '',
    })),
    plans: readRecentPlans().map((plan) => ({ ...plan, mine: false })),
  };
}

/**
 * Recently viewed (Me, 4.6): the places and trip plans opened, newest first. Kept by the account when signed in,
 * otherwise in this browser.
 */
export function RecentlyViewedPage() {
  const { user, status } = useUser();
  const { showConfirm, showError } = useDialog();
  const goBack = useBack(routes.profile);
  const userId = user?.id ?? null;
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${String(userId)}|${String(attempt)}`;
  const [result, setResult] = useState<{ requestKey: string; state: State } | null>(null);
  /** Signed out: what this browser remembers. */
  const [local, setLocal] = useState(localViewed);

  useEffect(() => {
    if (status === 'restoring' || userId === null) return;
    const controller = new AbortController();
    getRecentlyViewed(controller.signal)
      .then((viewed) => {
        setResult({ requestKey, state: { kind: 'ready', viewed } });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ requestKey, state: { kind: 'error', message: toErrorMessage(cause) } });
        }
      });
    return () => {
      controller.abort();
    };
  }, [status, userId, requestKey]);

  let state: State = { kind: 'loading' };
  if (status !== 'restoring' && userId === null) state = { kind: 'ready', viewed: local };
  else if (result?.requestKey === requestKey) state = result.state;

  const clear = async () => {
    if (!(await showConfirm('Clear everything you viewed?', 'Clear'))) return;
    try {
      if (userId === null) {
        forgetRecentSearches();
        forgetRecentPlans();
        setLocal(localViewed());
      } else {
        await clearRecentlyViewed();
        setAttempt((n) => n + 1);
      }
    } catch (cause) {
      await showError(toErrorMessage(cause, 'Could not clear the list.'));
    }
  };

  const viewed = state.kind === 'ready' ? state.viewed : null;
  const empty = viewed !== null && viewed.places.length === 0 && viewed.plans.length === 0;

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.title}>
          <img src={recentlyViewedIcon} alt="" className={styles.titleIcon} />
          Recently Viewed
        </h1>
      </PageHeader>
      {state.kind === 'loading' && <p className={styles.status}>Loading…</p>}
      {state.kind === 'error' && (
        <div className={styles.panel}>
          <p>{state.message}</p>
          <Button
            size="sm"
            onClick={() => {
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
        </div>
      )}
      {empty && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Nothing yet</p>
          <p>Places and trip plans you open show up here, newest first.</p>
          <Link to={routes.home} className={styles.link}>
            Find a place to explore
          </Link>
        </div>
      )}
      {viewed && !empty && (
        <>
          {userId === null && (
            <p className={styles.note}>
              Kept in this browser only. Sign in from the Profile tab to keep them with your
              account.
            </p>
          )}
          {viewed.places.length > 0 && (
            <section aria-labelledby="viewed-places" className={styles.section}>
              <h2 id="viewed-places" className={styles.subheading}>
                Places
              </h2>
              <ul className={styles.list}>
                {viewed.places.map(({ place, viewedAt }) => (
                  <li key={place.label}>
                    <Link
                      to={routes.destination(place.name, {
                        id: place.id || undefined,
                        q: place.label,
                      })}
                      className={styles.row}
                    >
                      <span className={styles.side}>{place.name}</span>
                      <span className={styles.main}>
                        <span className={styles.label}>{place.label}</span>
                        {viewedAt && <span className={styles.meta}>{timeAgo(viewedAt)}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {viewed.plans.length > 0 && (
            <section aria-labelledby="viewed-plans" className={styles.section}>
              <h2 id="viewed-plans" className={styles.subheading}>
                Trip plans
              </h2>
              <ul className={styles.list}>
                {viewed.plans.map((plan) => (
                  <li key={plan.id}>
                    <Link
                      to={plan.mine ? routes.plan(plan.id) : routes.sharedPlan(plan.id)}
                      className={styles.row}
                    >
                      <span className={styles.side}>{plan.placeName}</span>
                      <span className={styles.main}>
                        <span className={styles.label}>{plan.title}</span>
                        <span className={styles.meta}>
                          {plan.mine ? 'Your plan' : 'Shared with you'}
                          {plan.viewedAt ? ` · ${timeAgo(plan.viewedAt)}` : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className={styles.actions}>
            <Button size="sm" variant="outline" onClick={() => void clear()}>
              Clear list
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}
