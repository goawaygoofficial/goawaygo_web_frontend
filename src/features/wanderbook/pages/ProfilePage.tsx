import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Icon, PageHeader, PageShell } from '@/components';
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
import type { Person, Profile } from '../types';
import styles from './WanderbookPage.module.css';
import { t } from '@/lib/i18n';

function followLabel(profile: Profile): string {
  if (profile.relationship === 'following') return t('Following');
  if (profile.relationship === 'requested') return t('Requested');
  return profile.followsYou ? t('Follow back') : t('Follow');
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
  // The person as the previous page showed them (MorphLink), so their photo is here at once.
  const preview = (useLocation().state as { preview?: Person } | null)?.preview;
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
        {!current && preview?.publicId === publicId && (
          <ProfileHeader
            placeholder
            morphAvatar
            profile={{
              ...preview,
              coverUrl: null,
              bio: '',
              homeTown: preview.homeTown ?? '',
              posts: 0,
              followers: 0,
              following: 0,
              relationship: 'none',
              followsYou: false,
              blockedByYou: false,
              canSeePosts: false,
              followRequests: null,
            }}
          />
        )}
        {!current && preview?.publicId !== publicId && (
          <p className={shared.status}>{t('Loading…')}</p>
        )}
        {current?.error && <p className={shared.status}>{current.error}</p>}
        {profile && (
          <>
            <ProfileHeader profile={profile} morphAvatar>
              {!profile.blockedByYou && (
                <Button
                  type="button"
                  variant={profile.relationship === 'none' ? 'primary' : 'outline'}
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    act(() => follow(publicId, profile.relationship === 'none'));
                  }}
                >
                  {followLabel(profile)}
                </Button>
              )}
              {profile.followsYou && profile.relationship !== 'none' && (
                <span className={shared.muted}>{t('Follows you')}</span>
              )}
              <button
                type="button"
                className={shared.iconButton}
                aria-label={t('More')}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      !profile.blockedByYou &&
                      !window.confirm(
                        t("Block {0}? You won't see each other, and follows end.", profile.name),
                      )
                    ) {
                      return;
                    }
                    act(() => block(publicId, !profile.blockedByYou));
                  }}
                >
                  <Icon name="block" />
                  {profile.blockedByYou ? t('Unblock') : t('Block')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMenuOpen(false);
                    if (user) setReporting(true);
                    else void navigate(routes.profile);
                  }}
                >
                  <Icon name="flag_outlined" />
                  {t('Report')}
                </Button>
              </div>
            )}
            {error && <p className={shared.error}>{error}</p>}

            {profile.blockedByYou ? (
              <p className={shared.status}>{t('You blocked {0}.', profile.name)}</p>
            ) : !profile.canSeePosts ? (
              <p className={shared.status}>
                <Icon name="lock" /> {t('This profile is private. Follow to see their photos.')}
              </p>
            ) : posts.items ? (
              <>
                <PostGrid posts={posts.items} empty={t('No posts yet.')} />
                {posts.hasMore && (
                  <div className={shared.loadMore}>
                    <Button type="button" variant="outline" size="sm" onClick={posts.loadMore}>
                      {t('Load more')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className={shared.status}>{t('Loading…')}</p>
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
