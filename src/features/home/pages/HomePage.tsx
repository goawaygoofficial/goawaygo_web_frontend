import { usePageMeta } from '@/lib/pageMeta';
import flightsImage from '@/assets/images/flights.png';
import rentalsImage from '@/assets/images/rentals.png';
import staysImage from '@/assets/images/stays.png';
import { IconTile, PageHeader, PageShell } from '@/components';
import { useSavedPlaces } from '@/features/discover';
import { GetAppLink } from '@/features/getApp';
import { LegalLinks } from '@/features/legal';
import { useUnreadCount } from '@/features/notifications';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { DestinationSearch } from '../components/DestinationSearch';
import { RecentSearchesBanner } from '../components/RecentSearchesBanner';
import { TripIdeaCard } from '../components/TripIdeaCard';
import { TripIdeaCarousel } from '../components/TripIdeaCarousel';
import carouselStyles from '../components/TripIdeaCarousel.module.css';
import { useTripIdeas } from '../hooks/useTripIdeas';
import styles from './HomePage.module.css';
import { t } from '@/lib/i18n';

const CATEGORIES = [
  { title: 'Flights', imageSrc: flightsImage, to: routes.flights },
  { title: 'Stays', imageSrc: staysImage, to: routes.stays },
  { title: 'Rentals', imageSrc: rentalsImage, to: routes.rentals },
] as const;

export function HomePage() {
  usePageMeta(
    t('Home'),
    t(
      'Plan trips anywhere in the world: AI travel guides, day-by-day trip plans, flight prices, stays and car rentals.',
    ),
  );
  const { user } = useUser();
  const ideas = useTripIdeas();
  const saved = useSavedPlaces();
  const unread = useUnreadCount();

  return (
    <PageShell width="wide">
      <PageHeader showNotifications unreadNotifications={unread} />
      <h1 className="visually-hidden">{t('GoAwayGo home')}</h1>

      <div className={styles.top}>
        <div className={styles.planner}>
          <nav aria-label={t('Book travel')} className={styles.categories}>
            {CATEGORIES.map((category) => (
              <IconTile key={category.title} {...category} title={t(category.title)} size="lg" />
            ))}
          </nav>
          <DestinationSearch />
        </div>
        <RecentSearchesBanner />
      </div>

      <h2 className={styles.ideasHeading}>{t('IDEAS FOR YOUR NEXT TRIP ...')}</h2>
      {ideas === null && <p className={carouselStyles.status}>{t('Finding ideas…')}</p>}
      {ideas?.length === 0 && (
        <p className={carouselStyles.status}>
          {t('New ideas are on their way. Check back in a minute.')}
        </p>
      )}
      {ideas && ideas.length > 0 && (
        <TripIdeaCarousel
          ideas={ideas}
          label={t('Ideas for your next trip')}
          renderCard={(idea) => (
            <TripIdeaCard
              idea={idea}
              signedIn={user !== null}
              saved={saved.isSaved(idea.id)}
              onSave={saved.save}
            />
          )}
        />
      )}
      <div className={styles.getApp}>
        <GetAppLink />
      </div>
      <LegalLinks />
    </PageShell>
  );
}
