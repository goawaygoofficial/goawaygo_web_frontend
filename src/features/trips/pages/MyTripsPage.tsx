import { useState } from 'react';
import { Link } from 'react-router-dom';
import myTripsIcon from '@/assets/icons/mytrips_white.png';
import { ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import { useSavedPlaces } from '@/features/discover';
import type { SavedPlace } from '@/features/discover';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './MyTripsPage.module.css';

const TONES = [styles.sunset, styles.ember, styles.coral, styles.peach];

/** My Trips: the places saved from "Ideas for your next trip" (sign-in needed). */
export function MyTripsPage() {
  const { user, status } = useUser();
  const saved = useSavedPlaces();

  if (status === 'restoring') return <PageShell>{null}</PageShell>;

  if (!user) {
    return (
      <EmptyState
        title="Save places you love"
        text="Sign in to keep places from Ideas for your next trip in My Trips."
        link={{ to: routes.profile, label: 'Sign in' }}
      />
    );
  }
  if (saved.error) {
    return (
      <EmptyState title="My Trips" text={saved.error} link={{ to: routes.home, label: 'Home' }} />
    );
  }
  if (saved.places === null) return <PageShell>{null}</PageShell>;
  if (saved.places.length === 0) {
    return (
      <EmptyState
        title="No trips yet"
        text="Save places from Ideas for your next trip on Home, and they'll show up here."
        link={{ to: routes.home, label: 'Find ideas' }}
      />
    );
  }

  return (
    <PageShell width="wide">
      <PageHeader />
      <h1 className={styles.heading}>My Trips</h1>
      <ul className={styles.grid}>
        {saved.places.map((place, index) => (
          <SavedPlaceCard
            key={place.id}
            place={place}
            tone={TONES[index % TONES.length]}
            onRemove={saved.remove}
          />
        ))}
      </ul>
    </PageShell>
  );
}

function SavedPlaceCard({
  place,
  tone,
  onRemove,
}: {
  place: SavedPlace;
  tone: string | undefined;
  onRemove: (id: number) => Promise<void>;
}) {
  const [removing, setRemoving] = useState(false);
  const where = [place.area, place.country].filter(Boolean).join(', ');

  return (
    <li className={[styles.card, tone].filter(Boolean).join(' ')}>
      <span className={styles.where}>{where}</span>
      <span className={styles.name}>{place.name}</span>
      {place.category && <span className={styles.tag}>{place.category}</span>}
      <Link
        to={routes.destination(place.name, { q: `${place.name}, ${place.country}` })}
        className={styles.open}
        aria-label={`Open ${place.name}, ${place.country}`}
      />
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${place.name} from My Trips`}
        disabled={removing}
        onClick={() => {
          setRemoving(true);
          onRemove(place.id).catch(() => {
            setRemoving(false);
          });
        }}
      >
        <Icon name="delete_outline" />
      </button>
    </li>
  );
}

function EmptyState({
  title,
  text,
  link,
}: {
  title: string;
  text: string;
  link: { to: string; label: string };
}) {
  return (
    <PageShell>
      <PageHeader />
      <section className={styles.empty} aria-labelledby="trips-heading">
        <span className={styles.badge}>
          <img src={myTripsIcon} alt="" className={styles.icon} />
        </span>
        <h1 id="trips-heading" className={styles.title}>
          {title}
        </h1>
        <p className={styles.text}>{text}</p>
        <ButtonLink to={link.to}>{link.label}</ButtonLink>
      </section>
    </PageShell>
  );
}
