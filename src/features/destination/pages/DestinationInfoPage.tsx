import { Navigate, useParams } from 'react-router-dom';
import heroImage from '@/assets/images/home_image_01.png';
import { PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { routes } from '@/lib/routes';
import { InfoCard } from '../components/InfoCard';
import { getDestinationInfoItems } from '../destinationInfoItems';
import styles from './DestinationInfoPage.module.css';

export function DestinationInfoPage() {
  const { place = '' } = useParams();
  const goBack = useBack(routes.home);
  const placeName = place.trim();

  if (placeName.length === 0) return <Navigate to={routes.home} replace />;

  return (
    <PageShell width="wide">
      <PageHeader onBack={goBack} />
      <h1 className={styles.heading}>{placeName}</h1>
      <div className={styles.layout}>
        <img src={heroImage} alt="" className={styles.hero} />
        <ul className={styles.list} aria-label={`Travel information for ${placeName}`}>
          {getDestinationInfoItems(placeName).map((item) => (
            <InfoCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
