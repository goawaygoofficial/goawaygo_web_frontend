import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { PostGrid } from '../components/PostGrid';
import { ProfileHeader } from '../components/ProfileHeader';
import { ReportDialog } from '../components/ReportDialog';
import shared from '../components/Wanderbook.module.css';
import { usePaged } from '../hooks/usePaged';
import { block, follow, getProfile, getProfilePosts } from '../services/wanderbookService';
import type { Profile } from '../types';
import styles from './WanderbookPage.module.css';

function followLabel(profile: Profile): string {
  if (profile.relationship === 'following') return 'Following';
  if (profile.relationship === 'requested') return 'Requested';
  return profile.followsYou ? 'Follow back' : 'Follow';
}

/** Another traveller's profile: Follow (or request), their posts if you may see them, block and report. */
export function ProfilePage() {
  const { publicId = '' } = useParams();
  const goBack = useBack(routes.wanderbook);
  const navigate = useNavigate();
  const { user, status } = useUser();
  const [loaded, setLoaded] = useState<{
    key: string;
    profile: Profile | null;
    error: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = `${publicId}|${String(user?.id)}|${status}`;

  useEffect(() => {
    if (status === 'restoring') return;
    const controller = new AbortController();
    getProfile(publicId, controller.signal)
      .then((profile) => {
        setLoaded({ key, profile, error: null });
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setLoaded({ key, profile: null, error: toErrorMessage(cause) });
      });
    return () => {
      controller.abort();
    };
  }, [key, publicId, status]);

  const current = loaded?.key === key ? loaded : null;
  const profile = current?.profile ?? null;
  const posts = usePaged(
    `posts|${key}|${String(profile?.canSeePosts)}|${String(profile?.relationship)}`,
    (cursor, signal) =>
      profile?.canSeePosts
        ? getProfilePosts(publicId, cursor, signal)
        : Promise.resolve({ items: [], nextCursor: null }),
  );

  if (profile?.relationship === 'self') return <Navigate to={routes.wanderbook} replace />;

  const act = (action: () => Promise<unknown>) => {
    if (!user) {
      void navigate(routes.profile);
      return;
    }
    setBusy(true);
    setError(null);
    action()
      .then(() => getProfile(publicId))
      .then((next) => {
        setLoaded({ key, profile: next, error: null });
      })
      .catch((cause: unknown) => {
        setError(toErrorMessage(cause));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <PageShell width="wide" className={styles.page}>
      <PageHeader onBack={goBack} />
      <div className={styles.column}>
        {!current && <p className={shared.status}>Loading…</p>}
        {current?.error && <p className={shared.status}>{current.error}</p>}
        {profile && (
          <>
            <ProfileHeader profile={profile}>
              {!profile.blockedByYou && (
                <button
                  type="button"
                  className={[shared.pillButton, profile.relationship !== 'none' && shared.quiet]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={busy}
                  onClick={() => {
                    act(() => follow(publicId, profile.relationship === 'none'));
                  }}
                >
                  {followLabel(profile)}
                </button>
              )}
              {profile.followsYou && profile.relationship !== 'none' && (
                <span className={shared.muted}>Follows you</span>
              )}
              <button
                type="button"
                className={shared.iconButton}
                aria-label="More"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((open) => !open);
                }}
              >
                <Icon name="more_horiz" />
              </button>
            </ProfileHeader>
            {menuOpen && (
              <div className={styles.invite}>
                <button
                  type="button"
                  className={`${shared.pillButton} ${shared.quiet}`}
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      !profile.blockedByYou &&
                      !window.confirm(
                        `Block ${profile.name}? You won't see each other, and follows end.`,
                      )
                    ) {
                      return;
                    }
                    act(() => block(publicId, !profile.blockedByYou));
                  }}
                >
                  <Icon name="block" />
                  {profile.blockedByYou ? 'Unblock' : 'Block'}
                </button>
                <button
                  type="button"
                  className={`${shared.pillButton} ${shared.quiet}`}
                  onClick={() => {
                    setMenuOpen(false);
                    if (user) setReporting(true);
                    else void navigate(routes.profile);
                  }}
                >
                  <Icon name="flag_outlined" />
                  Report
                </button>
              </div>
            )}
            {error && <p className={shared.error}>{error}</p>}

            {profile.blockedByYou ? (
              <p className={shared.status}>You blocked {profile.name}.</p>
            ) : !profile.canSeePosts ? (
              <p className={shared.status}>
                <Icon name="lock" /> This profile is private. Follow to see their photos.
              </p>
            ) : posts.items ? (
              <>
                <PostGrid posts={posts.items} empty="No posts yet." />
                {posts.hasMore && (
                  <div className={shared.loadMore}>
                    <button
                      type="button"
                      className={`${shared.pillButton} ${shared.quiet}`}
                      onClick={posts.loadMore}
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className={shared.status}>Loading…</p>
            )}
            <ReportDialog
              target={reporting ? { type: 'user', id: publicId, label: profile.name } : null}
              onClose={() => {
                setReporting(false);
              }}
            />
          </>
        )}
      </div>
    </PageShell>
  );
}
