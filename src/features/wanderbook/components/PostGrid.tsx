import { Icon, MorphLink } from '@/components';
import { routes } from '@/lib/routes';
import type { Post } from '../types';
import styles from './PostGrid.module.css';

/** A profile's posts as square tiles of their first photo; opens the post. */
export function PostGrid({ posts, empty }: { posts: readonly Post[]; empty: string }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>{empty}</p>;
  }
  return (
    <ul className={styles.grid}>
      {posts.map((post) => {
        const cover = post.photos[0];
        return (
          <li key={post.publicId} className={styles.tile}>
            <MorphLink
              state={{ preview: post }}
              to={routes.wanderbookPost(post.publicId)}
              className={styles.link}
              aria-label={post.place ? `Post at ${post.place.name}` : 'Post'}
            >
              {cover && (
                <img
                  src={cover.url}
                  style={{ viewTransitionName: `post-${post.publicId}` }}
                  alt=""
                  loading="lazy"
                  className={styles.image}
                />
              )}
              {post.photos.length > 1 && (
                <span className={styles.multi} aria-hidden="true">
                  <Icon name="photo_library" />
                </span>
              )}
            </MorphLink>
          </li>
        );
      })}
    </ul>
  );
}
