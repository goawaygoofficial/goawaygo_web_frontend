import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components';
import type { TripIdea } from '@/features/discover';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import styles from './TripIdeaCarousel.module.css';

interface TripIdeaCardProps {
  idea: TripIdea;
  signedIn: boolean;
  saved: boolean;
  onSave: (idea: TripIdea) => Promise<void>;
}

function saveLabel(state: { saved: boolean; saving: boolean; failed: boolean; signedIn: boolean }) {
  if (state.saved) return 'Saved';
  if (state.saving) return 'Saving…';
  if (state.failed) return 'Try again';
  return state.signedIn ? 'Save to My Trips' : 'Sign in to save';
}

/** One idea: its photo (with credit), where it is, a short summary, tags, and Save to My Trips. */
export function TripIdeaCard({ idea, signedIn, saved, onSave }: TripIdeaCardProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const where = [idea.area, idea.country].filter(Boolean).join(', ');

  const save = () => {
    if (!signedIn) {
      void navigate(routes.profile);
      return;
    }
    setSaving(true);
    setFailed(false);
    onSave(idea)
      .then(() => {
        track({ name: 'trip_idea_saved', props: { kind: idea.kind } });
      })
      .catch(() => {
        setFailed(true);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <article className={styles.card}>
      <img
        src={idea.photo.url}
        alt=""
        className={styles.cardImage}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className={styles.cardBody}>
        <span className={styles.cardEyebrow}>{where}</span>
        <h3 className={styles.cardTitle}>{idea.name}</h3>
        <span className={styles.cardTagline}>{idea.summary}</span>
        <span className={styles.tags}>
          {idea.category && <span className={styles.tag}>{idea.category}</span>}
          {idea.kind === 'hidden gem' && <span className={styles.tag}>Hidden gem</span>}
        </span>
      </div>
      {/* The whole card opens the place; Save and the credit sit above this link. */}
      <Link
        to={routes.destination(idea.name, { q: `${idea.name}, ${idea.country}` })}
        className={styles.cardLink}
        aria-label={`Open ${idea.name}, ${idea.country}`}
      />
      <button
        type="button"
        className={[styles.save, saved && styles.saved].filter(Boolean).join(' ')}
        disabled={saving || saved}
        onClick={save}
      >
        <Icon name={saved ? 'bookmark' : 'bookmark_border'} />
        {saveLabel({ saved, saving, failed, signedIn })}
      </button>
      <a
        href={idea.photo.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.credit}
      >
        {idea.photo.credit}
      </a>
    </article>
  );
}
