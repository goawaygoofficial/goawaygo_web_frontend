import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import backdropImage from '@/assets/images/home_image_01.png';
import { Icon } from '@/components';
import { routes } from '@/lib/routes';
import { useCollapseOnScroll } from '../hooks/useCollapseOnScroll';
import type { Profile } from '../types';
import styles from './ProfileHeader.module.css';

/**
 * Cover, profile photo, name, home town, counts and bio, with the actions under it (Follow, Edit profile, ...).
 * Scales, fades and slides away as the page scrolls.
 */
export function ProfileHeader({
  profile,
  children,
  morphAvatar = false,
  placeholder = false,
}: {
  profile: Profile;
  children?: ReactNode;
  /** The photo is where a person's photo in a list morphs to (not on your own tab, where it could appear twice). */
  morphAvatar?: boolean;
  /** Only the photo, cover and name (drawn at once from a preview while the profile loads). */
  placeholder?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useCollapseOnScroll(ref);
  const listsVisible = profile.canSeePosts;

  const stat = (label: string, count: number, list?: 'followers' | 'following') => {
    const content = (
      <>
        <dt className={styles.statLabel}>{label}</dt>
        <dd className={styles.statCount}>{count}</dd>
      </>
    );
    return (
      <div key={label} className={styles.stat}>
        {list && listsVisible ? (
          <Link to={routes.wanderbookPeople(profile.publicId, list)} className={styles.statLink}>
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    );
  };

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.backdrop}>
        <img src={profile.coverUrl ?? backdropImage} alt="" className={styles.backdropImage} />
        <span
          className={styles.avatar}
          style={morphAvatar ? { viewTransitionName: `avatar-${profile.publicId}` } : undefined}
          aria-hidden="true"
        >
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="" className={styles.avatarImage} />
          ) : (
            <Icon name="person" />
          )}
        </span>
      </div>

      <h1 className={styles.name}>
        {profile.name}
        {profile.isPrivate && (
          <span className={styles.lock} title="Private profile">
            <Icon name="lock" />
            <span className="visually-hidden">(private profile)</span>
          </span>
        )}
      </h1>
      {profile.homeTown && <p className={styles.location}>{profile.homeTown}</p>}

      {!placeholder && (
        <div className={styles.details}>
          <dl className={styles.stats}>
            {stat('Posts', profile.posts)}
            {stat('Followers', profile.followers, 'followers')}
            {stat('Following', profile.following, 'following')}
          </dl>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          {children && <div className={styles.actionsRow}>{children}</div>}
        </div>
      )}
    </header>
  );
}
