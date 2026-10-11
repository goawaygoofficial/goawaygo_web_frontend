import { Icon } from '@/components';
import type { WanderPost } from '../types';
import styles from './PostGrid.module.css';

export function PostGrid({ posts }: { posts: readonly WanderPost[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>No posts match that destination.</p>;
  }
  return (
    <ul className={styles.grid}>
      {posts.map((post) => (
        <li key={post.id} className={styles.card}>
          <span className={styles.location}>
            <Icon name="place" />
            {post.location}
          </span>
          <p className={styles.caption}>{post.caption}</p>
        </li>
      ))}
    </ul>
  );
}
