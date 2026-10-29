import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components';
import { routes } from '@/lib/routes';
import type { Person } from '../types';
import styles from './Wanderbook.module.css';

/** A round profile photo, or a person icon when there is none. */
export function Avatar({ url, size }: { url: string | null; size: string }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">
      {url ? <img src={url} alt="" loading="lazy" /> : <Icon name="person" />}
    </span>
  );
}

/** One person in a list: photo, name and home town (linking to the profile), and optional buttons. */
export function PersonRow({ person, actions }: { person: Person; actions?: ReactNode }) {
  return (
    <li className={styles.personRow}>
      <Link to={routes.wanderbookProfile(person.publicId)} className={styles.personLink}>
        <Avatar url={person.photoUrl} size="2.75rem" />
        <span className={styles.personText}>
          <span className={styles.personName}>{person.name}</span>
          {person.homeTown && <span className={styles.muted}>{person.homeTown}</span>}
        </span>
      </Link>
      {actions}
    </li>
  );
}
