import { Button } from '@/components';
import { useState } from 'react';
import type { Paged } from '../hooks/usePaged';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { ReportDialog } from './ReportDialog';
import shared from './Wanderbook.module.css';

/** Posts one under another (the feed), with "Load more" and reporting. */
export function FeedList({ feed, empty }: { feed: Paged<Post>; empty: string }) {
  const [reporting, setReporting] = useState<Post | null>(null);

  if (feed.error) return <p className={shared.status}>{feed.error}</p>;
  if (!feed.items) return <p className={shared.status}>Loading…</p>;
  if (feed.items.length === 0) return <p className={shared.status}>{empty}</p>;

  return (
    <>
      {feed.items.map((post) => (
        <PostCard
          key={post.publicId}
          post={post}
          onChange={(changed) => {
            feed.update((items) =>
              items.map((p) => (p.publicId === changed.publicId ? changed : p)),
            );
          }}
          onDeleted={() => {
            feed.update((items) => items.filter((p) => p.publicId !== post.publicId));
          }}
          onReport={setReporting}
        />
      ))}
      {feed.hasMore && (
        <div className={shared.loadMore}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={feed.loadingMore}
            onClick={feed.loadMore}
          >
            {feed.loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
      <ReportDialog
        target={reporting && { type: 'post', id: reporting.publicId, label: 'this post' }}
        onClose={() => {
          setReporting(null);
        }}
      />
    </>
  );
}
