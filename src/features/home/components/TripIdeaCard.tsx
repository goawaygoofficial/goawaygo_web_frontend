import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';
import type { TripIdea } from '../types';
import styles from './TripIdeaCarousel.module.css';

export function TripIdeaCard({ idea }: { idea: TripIdea }) {
  return (
    <Link
      to={routes.destination(idea.destination)}
      className={[styles.card, styles[idea.tone]].join(' ')}
    >
      <span className={styles.cardEyebrow}>
        {idea.destination}, {idea.country}
      </span>
      <span className={styles.cardTitle}>{idea.title}</span>
      <span className={styles.cardTagline}>{idea.tagline}</span>
    </Link>
  );
}
