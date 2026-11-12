import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { PersonRow } from '../components/People';
import shared from '../components/Wanderbook.module.css';
import { usePaged } from '../hooks/usePaged';
import {
  answerFollowRequest,
  block,
  getBlocked,
  getFollowRequests,
  getFollows,
  getMyProfile,
  removeFollower,
} from '../services/wanderbookService';
import type { Person } from '../types';
import styles from './PostPage.module.css';
import { t } from '@/lib/i18n';

type Mode = 'followers' | 'following' | 'requests' | 'blocked';

const TITLES: Record<Mode, string> = {
  followers: 'Followers',
  following: 'Following',
  requests: 'Follow requests',
  blocked: 'Blocked people',
};

/** Followers or following of a profile; your follow requests (approve or decline); people you blocked. */
export function PeoplePage({ mode }: { mode?: 'requests' | 'blocked' }) {
  const params = useParams();
  const { user, status } = useUser();
  const goBack = useBack(routes.wanderbook);
  const list: Mode = mode ?? (params.list === 'following' ? 'following' : 'followers');
  const publicId = params.publicId ?? '';
  const [myId, setMyId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const people = usePaged(`${list}|${publicId}|${String(user?.id)}`, (cursor, signal) => {
    if (list === 'requests') return getFollowRequests(cursor, signal);
    if (list === 'blocked') return Promise.resolve({ items: [], nextCursor: null });
    return getFollows(publicId, list, cursor, signal);
  });

  useEffect(() => {
    if (list !== 'blocked' || !user) return;
    getBlocked().then(setBlocked, (cause: unknown) => {
      setError(toErrorMessage(cause));
    });
  }, [list, user]);

  useEffect(() => {
    if (!user || list === 'blocked' || list === 'requests') return;
    getMyProfile().then(
      (me) => {
        setMyId(me.publicId);
      },
      () => {
        // Without it, the Remove buttons on your own followers just don't show.
      },
    );
  }, [user, list]);

  if (mode && status !== 'restoring' && !user) return <Navigate to={routes.profile} replace />;

  const items = list === 'blocked' ? blocked : people.items;
  const remove = (person: Person) => {
    if (list === 'blocked')
      setBlocked((current) => current?.filter((p) => p.publicId !== person.publicId) ?? null);
    else people.update((current) => current.filter((p) => p.publicId !== person.publicId));
  };
  const run = (action: Promise<unknown>, person: Person) => {
    action.then(
      () => {
        remove(person);
      },
      (cause: unknown) => {
        setError(toErrorMessage(cause));
      },
    );
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.heading}>{t(TITLES[list])}</h1>
      </PageHeader>
      <div className={styles.column}>
        {error && <p className={shared.error}>{error}</p>}
        {people.error && list !== 'blocked' && <p className={shared.status}>{people.error}</p>}
        {!items && !people.error && <p className={shared.status}>{t('Loading…')}</p>}
        {items?.length === 0 && <p className={shared.status}>{t('Nobody here yet.')}</p>}
        <ul className={shared.list}>
          {items?.map((person) => (
            <PersonRow
              key={person.publicId}
              person={person}
              actions={
                list === 'requests' ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        run(answerFollowRequest(person.publicId, true), person);
                      }}
                    >
                      {t('Approve')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        run(answerFollowRequest(person.publicId, false), person);
                      }}
                    >
                      {t('Decline')}
                    </Button>
                  </>
                ) : list === 'blocked' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      run(block(person.publicId, false), person);
                    }}
                  >
                    {t('Unblock')}
                  </Button>
                ) : list === 'followers' && myId === publicId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      run(removeFollower(person.publicId), person);
                    }}
                  >
                    {t('Remove')}
                  </Button>
                ) : undefined
              }
            />
          ))}
        </ul>
        {people.hasMore && list !== 'blocked' && (
          <div className={shared.loadMore}>
            <Button type="button" variant="outline" size="sm" onClick={people.loadMore}>
              {t('Load more')}
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
