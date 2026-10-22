import flightsImage from '@/assets/images/flights.png';
import heroImage from '@/assets/images/home_image_01.png';
import rentalsImage from '@/assets/images/rentals.png';
import staysImage from '@/assets/images/stays.png';
import { IconTile, PageHeader, PageShell } from '@/components';
import { GetAppLink } from '@/features/getApp';
import { LegalLinks } from '@/features/legal';
import { routes } from '@/lib/routes';
import { DestinationSearch } from '../components/DestinationSearch';
import { TripIdeaCarousel } from '../components/TripIdeaCarousel';
import { PLACEHOLDER_TRIP_IDEAS } from '../data/tripIdeas';
import styles from './HomePage.module.css';

const CATEGORIES = [
  { title: 'Flights', imageSrc: flightsImage, to: routes.flights },
  { title: 'Stays', imageSrc: staysImage, to: routes.stays },
  { title: 'Rentals', imageSrc: rentalsImage, to: routes.rentals },
] as const;

export function HomePage() {
  return (
    <PageShell width="wide">
      <PageHeader showNotifications />
      <h1 className="visually-hidden">GoAwayGo home</h1>

      <div className={styles.top}>
        <div className={styles.planner}>
          <nav aria-label="Book travel" className={styles.categories}>
            {CATEGORIES.map((category) => (
              <IconTile key={category.title} {...category} size="lg" />
            ))}
          </nav>
          <DestinationSearch />
        </div>
        <img src={heroImage} alt="" className={styles.hero} />
      </div>

      <h2 className={styles.ideasHeading}>IDEAS FOR YOUR NEXT TRIP ...</h2>
      <TripIdeaCarousel ideas={PLACEHOLDER_TRIP_IDEAS} label="Ideas for your next trip" />
      <div className={styles.getApp}>
        <GetAppLink />
      </div>
      <LegalLinks />
    </PageShell>
  );
}
