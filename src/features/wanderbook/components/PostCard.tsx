import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, MorphLink } from '@/components';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { deletePost, likePost } from '../services/wanderbookService';
import { timeAgo } from '@/lib/timeAgo';
import type { Post } from '../types';
import { Avatar } from './People';
import { PhotoCarousel } from './PhotoCarousel';
import styles from './PostCard.module.css';
import shared from './Wanderbook.module.css';

interface PostCardProps {
  post: Post;
  onChange: (post: Post) => void;
  onDeleted: () => void;
  onReport: (post: Post) => void;
  /** On the post's own page: the caption isn't shortened and there's no comments link. */
  full?: boolean;
}

/** A post: who and where, its photos, likes, comments, caption, and a menu (report, or edit and delete yours). */
export function PostCard({ post, onChange, onDeleted, onReport, full = false }: PostCardProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const place = post.place;

  const toggleLike = () => {
    if (!user) {
      void navigate(routes.profile);
      return;
    }
    const liked = !post.likedByYou;
    // Show it at once; the server's answer replaces it.
    onChange({ ...post, likedByYou: liked, likes: post.likes + (liked ? 1 : -1) });
    likePost(post.publicId, liked).then(onChange, (cause: unknown) => {
      onChange(post);
      setError(toErrorMessage(cause));
    });
  };

  return (
    <article className={styles.card} aria-label={`Post by ${post.author.name}`}>
      <header className={styles.head}>
        <Link to={routes.wanderbookProfile(post.author.publicId)} className={shared.personLink}>
          <Avatar url={post.author.photoUrl} size="2.5rem" />
          <span className={shared.personText}>
            <span className={shared.personName}>{post.author.name}</span>
            {place && (
              <span className={shared.muted}>
                {[place.name, place.region, place.country].filter(Boolean).join(', ')}
              </span>
            )}
          </span>
        </Link>
        <div className={styles.menuWrap}>
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
          {menuOpen && (
            <div className={styles.menu} role="menu">
              {place && (
                <Link
                  role="menuitem"
                  to={routes.destination(place.name, {
                    q: [place.name, place.country].filter(Boolean).join(', '),
                  })}
                >
                  About {place.name}
                </Link>
              )}
              {post.isYours ? (
                <>
                  <Link role="menuitem" to={`${routes.wanderbookPost(post.publicId)}?edit=1`}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      if (!window.confirm('Delete this post? Its photos are deleted too.')) return;
                      deletePost(post.publicId).then(onDeleted, (cause: unknown) => {
                        setError(toErrorMessage(cause));
                      });
                    }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    if (user) onReport(post);
                    else void navigate(routes.profile);
                  }}
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <PhotoCarousel
        photos={post.photos}
        label={`Photos by ${post.author.name}`}
        morphName={`post-${post.publicId}`}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={[shared.iconButton, post.likedByYou && styles.liked].filter(Boolean).join(' ')}
          aria-pressed={post.likedByYou}
          aria-label={post.likedByYou ? 'Unlike' : 'Like'}
          onClick={toggleLike}
        >
          <Icon name={post.likedByYou ? 'favorite' : 'favorite_border'} />
        </button>
        {!full && (
          <MorphLink
            state={{ preview: post }}
            to={routes.wanderbookPost(post.publicId)}
            className={shared.iconButton}
            aria-label="Comments"
          >
            <Icon name="chat_bubble_outline" />
          </MorphLink>
        )}
      </div>
      <p className={styles.counts}>
        {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        {post.comments > 0 && !full && (
          <>
            {' · '}
            <MorphLink state={{ preview: post }} to={routes.wanderbookPost(post.publicId)}>
              {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
            </MorphLink>
          </>
        )}
      </p>
      {post.caption && (
        <p className={[styles.caption, !full && styles.clamped].filter(Boolean).join(' ')}>
          <Link to={routes.wanderbookProfile(post.author.publicId)} className={shared.personName}>
            {post.author.name}
          </Link>{' '}
          {post.caption}
        </p>
      )}
      <p className={shared.muted}>
        <MorphLink
          state={{ preview: post }}
          to={routes.wanderbookPost(post.publicId)}
          className={styles.time}
        >
          {timeAgo(post.createdAt)}
        </MorphLink>
        {post.editedAt && ' · edited'}
      </p>
      {error && <p className={shared.error}>{error}</p>}
    </article>
  );
}
