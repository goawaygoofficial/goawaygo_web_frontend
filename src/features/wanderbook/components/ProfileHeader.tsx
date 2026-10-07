import { useRef } from 'react';
import { Camera, Pencil, User } from 'lucide-react';
import backdropImage from '@/assets/images/home_image_01.png';
import { useCollapseOnScroll } from '../hooks/useCollapseOnScroll';
import type { WanderbookProfile } from '../types';
import styles from './ProfileHeader.module.css';

/** Backdrop, avatar, name, stats and bio. Scales, fades and slides away as the page scrolls. */
export function ProfileHeader({ profile }: { profile: WanderbookProfile }) {
  const ref = useRef<HTMLElement>(null);
  useCollapseOnScroll(ref);

  const stats = [
    { label: 'Posts', count: profile.stats.posts },
    { label: 'Followers', count: profile.stats.followers },
    { label: 'Following', count: profile.stats.following },
  ];

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.backdrop}>
        <img src={backdropImage} alt="" className={styles.backdropImage} />
        <button
          type="button"
          className={styles.camera}
          disabled
          aria-label="Change cover photo (coming soon)"
          title="Coming soon"
        >
          <Camera aria-hidden="true" />
        </button>
        <span className={styles.avatar} aria-hidden="true">
          <User />
        </span>
      </div>

      <h1 className={styles.name}>{profile.name}</h1>
      <p className={styles.location}>{profile.location}</p>

      <div className={styles.details}>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statCount}>{stat.count}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.bioRow}>
          <p className={styles.bio}>
            {profile.bio.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <button
            type="button"
            className={styles.edit}
            disabled
            aria-label="Edit bio (coming soon)"
            title="Coming soon"
          >
            <Pencil aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
