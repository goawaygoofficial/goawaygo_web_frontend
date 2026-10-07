import { Link } from 'react-router-dom';
import myTripsIcon from '@/assets/icons/mytrips_white.png';
import { PageHeader, PageShell } from '@/components';
import { routes } from '@/lib/routes';
import styles from './MyTripsPage.module.css';

/**
 * The app's My Trips tab is a placeholder (`Text('My Trips Page')`) and there is no trips API,
 * so this is an honest empty state rather than an invented feature.
 */
export function MyTripsPage() {
  return (
    <PageShell>
      <PageHeader showNotifications />
      <section className={styles.empty} aria-labelledby="trips-heading">
        <span className={styles.badge}>
          <img src={myTripsIcon} alt="" className={styles.icon} />
        </span>
        <h1 id="trips-heading" className={styles.title}>
          No trips yet
        </h1>
        <p className={styles.text}>
          Trips you book with Goaway will show up here. Start by finding a flight, a stay or a car.
        </p>
        <Link to={routes.home} className={styles.cta}>
          Plan a trip
        </Link>
      </section>
    </PageShell>
  );
}
