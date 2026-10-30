import { useEffect, useState } from 'react';
import { Button, ButtonLink, Icon, PageShell } from '@/components';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { FeedList } from '../components/FeedList';
import { PostGrid } from '../components/PostGrid';
import { ProfileHeader } from '../components/ProfileHeader';
import { panelId, tabId } from '../components/tabIds';
import shared from '../components/Wanderbook.module.css';
import { WanderbookSearchBar } from '../components/WanderbookSearchBar';
import { WanderbookTabs } from '../components/WanderbookTabs';
import { usePaged } from '../hooks/usePaged';
import { getFeed, getMyProfile, getProfilePosts } from '../services/wanderbookService';
import type { Profile, WanderbookTab } from '../types';
import styles from './WanderbookPage.module.css';

/**
 * The Wanderbook tab. Signed in: your profile, "My Wanderposts" (your grid) and "Feed" (everyone's newest posts).
 * Signed out: the feed (anyone can view) and an invitation to sign in and post.
 */
export function WanderbookPage() {
  const { user, status } = useUser();
  const [tab, setTab] = useState<WanderbookTab>('mine');
  const [me, setMe] = useState<{ userId: number; profile: Profile } | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId === null) return;
    const controller = new AbortController();
    getMyProfile(controller.signal)
      .then((profile) => {
        setMe({ userId, profile });
      })
      .catch(() => {
        // The feed still works; the header just doesn't show.
      });
    return () => {
      controller.abort();
    };
  }, [userId]);

  const profile = me?.userId === userId ? me.profile : null;
  const shownTab: WanderbookTab = user ? tab : 'feed';
  const feed = usePaged(`feed|${String(userId)}|${status}`, getFeed);
  const mine = usePaged(`mine|${profile?.publicId ?? ''}`, (cursor, signal) =>
    profile
      ? getProfilePosts(profile.publicId, cursor, signal)
      : Promise.resolve({ items: [], nextCursor: null }),
  );

  return (
    <PageShell width="wide" className={styles.page}>
      <WanderbookSearchBar />
      <div className={styles.column}>
        {user && profile && (
          <ProfileHeader profile={profile}>
            <ButtonLink to={routes.wanderbookNewPost} size="sm">
              <Icon name="add_a_photo" />
              New post
            </ButtonLink>
            <ButtonLink to={routes.wanderbookEditProfile} variant="outline" size="sm">
              Edit profile
            </ButtonLink>
            {profile.followRequests !== null && profile.followRequests > 0 && (
              <ButtonLink to={routes.wanderbookRequests} variant="outline" size="sm">
                Requests ({profile.followRequests})
              </ButtonLink>
            )}
          </ProfileHeader>
        )}
        {!user && status !== 'restoring' && (
          <section className={styles.invite}>
            <h1 className={styles.inviteTitle}>Your travel scrapbook</h1>
            <p className={shared.muted}>
              Keep your trip photos as they are, tag the places, and follow other travellers.
            </p>
            <ButtonLink to={routes.profile} size="sm">
              Sign in to post
            </ButtonLink>
          </section>
        )}

        {user && <WanderbookTabs value={shownTab} onChange={setTab} />}
        <section
          id={user ? panelId(shownTab) : undefined}
          role={user ? 'tabpanel' : undefined}
          aria-labelledby={user ? tabId(shownTab) : undefined}
          aria-label={user ? undefined : 'Feed'}
        >
          {shownTab === 'mine' ? (
            mine.items ? (
              <>
                <PostGrid posts={mine.items} empty="Share your first trip: tap New post." />
                {mine.hasMore && (
                  <div className={shared.loadMore}>
                    <Button type="button" variant="outline" size="sm" onClick={mine.loadMore}>
                      Load more
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className={shared.status}>{mine.error ?? 'Loading…'}</p>
            )
          ) : (
            <FeedList feed={feed} empty="No posts yet. Be the first to share a trip!" />
          )}
        </section>
      </div>
    </PageShell>
  );
}
