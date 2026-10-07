import { useState } from 'react';
import { PageShell } from '@/components';
import { useUser } from '@/providers';
import { PostGrid } from '../components/PostGrid';
import { ProfileHeader } from '../components/ProfileHeader';
import { WanderbookSearchBar } from '../components/WanderbookSearchBar';
import { panelId, tabId } from '../components/tabIds';
import { WanderbookTabs } from '../components/WanderbookTabs';
import { MOCK_FEED_POSTS, MOCK_MY_POSTS, MOCK_WANDERBOOK_PROFILE } from '../data/mockWanderbook';
import type { WanderbookProfile, WanderbookTab } from '../types';
import styles from './WanderbookPage.module.css';

export function WanderbookPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<WanderbookTab>('mine');
  const [query, setQuery] = useState('');

  const profile: WanderbookProfile = user
    ? { ...MOCK_WANDERBOOK_PROFILE, name: user.name }
    : MOCK_WANDERBOOK_PROFILE;

  const needle = query.trim().toLowerCase();
  const posts = (tab === 'mine' ? MOCK_MY_POSTS : MOCK_FEED_POSTS).filter((post) =>
    post.location.toLowerCase().includes(needle),
  );

  return (
    <PageShell width="wide" className={styles.page}>
      <WanderbookSearchBar value={query} onChange={setQuery} />
      <div className={styles.headerColumn}>
        <ProfileHeader profile={profile} />
      </div>
      <WanderbookTabs value={tab} onChange={setTab} />
      <section id={panelId(tab)} role="tabpanel" aria-labelledby={tabId(tab)}>
        <p className={styles.sampleNote}>
          Sample posts — Wanderbook isn’t connected to the backend yet.
        </p>
        <PostGrid posts={posts} />
      </section>
    </PageShell>
  );
}
