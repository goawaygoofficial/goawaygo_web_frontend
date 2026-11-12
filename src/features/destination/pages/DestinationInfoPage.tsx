import { usePageMeta } from '@/lib/pageMeta';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import { PhotoSlider, placeContext } from '@/features/discover';
import { planPlaceQuery } from '@/features/plans';
import type { DestinationPage, DestinationQuery, PhotoSlide } from '@/features/discover';
import { useBack } from '@/hooks';
import { routes } from '@/lib/routes';
import { InfoCard } from '../components/InfoCard';
import { TravelLoader } from '../components/TravelLoader';
import { useDestination } from '../hooks/useDestination';
import styles from './DestinationInfoPage.module.css';
import { t } from '@/lib/i18n';

function photoSlides(page: DestinationPage): PhotoSlide[] {
  if (page.spots.length === 0) {
    return [{ key: page.place.label, title: page.place.name, photo: null }];
  }
  return page.spots.map((spot) => ({ key: spot.photo.url, title: spot.name, photo: spot.photo }));
}

/**
 * A destination: a banner of its tourist spots and nine AI-written info cards. The whole page appears at once,
 * after a travel animation, when everything is ready.
 */
export function DestinationInfoPage() {
  const { place = '' } = useParams();
  const [search] = useSearchParams();
  const goBack = useBack(routes.home);
  const placeName = place.trim();
  usePageMeta(
    t('{0} travel guide', placeName),
    t(
      '{0}: visa and entry rules, the best time to visit, top attractions, where to stay, food and getting around.',
      placeName,
    ),
  );
  const id = search.get('id');
  const query: DestinationQuery = id ? { placeId: id } : { text: search.get('q') ?? placeName };
  const { state, retry } = useDestination(query);

  if (placeName.length === 0) return <Navigate to={routes.home} replace />;

  return (
    <PageShell width="wide">
      <PageHeader onBack={goBack} />
      {state.kind === 'loading' && <TravelLoader place={placeName} />}

      {state.kind === 'notFound' && (
        <Message
          title={t("We couldn't find that place")}
          text={t(
            'Check the spelling of “{0}”, or pick a place from the suggestions while you type.',
            placeName,
          )}
        />
      )}

      {state.kind === 'error' && (
        <Message title={t('Something went wrong')} text={state.message} onRetry={retry} />
      )}

      {state.kind === 'ready' && state.page.status === 'unknown' && (
        <Message
          title={t("We don't know {0} well enough yet", state.page.place.name)}
          text={t('Try the nearest city or a better-known place nearby.')}
        />
      )}

      {state.kind === 'ready' && state.page.status !== 'unknown' && (
        <>
          <h1 className={styles.heading}>{state.page.place.name}</h1>
          {placeContext(state.page.place) && (
            <p className={styles.context}>{placeContext(state.page.place)}</p>
          )}
          <ButtonLink
            size="sm"
            className={styles.plan}
            icon={<Icon name="travel_explore" />}
            to={`${routes.planNew}?${planPlaceQuery({
              placeId: state.page.place.id,
              name: state.page.place.name,
              area: state.page.place.region || state.page.place.city,
              country: state.page.place.country,
              lat: state.page.place.lat,
              lon: state.page.place.lon,
            })}`}
          >
            {t('Plan a trip here')}
          </ButtonLink>
          <div className={styles.layout}>
            <PhotoSlider
              slides={photoSlides(state.page)}
              label={t('Photos of {0}', state.page.place.name)}
              className={styles.photos}
            />
            {state.page.status === 'busy' ? (
              <div className={styles.busy} role="alert">
                <p className={styles.busyTitle}>{t('Our travel guide is busy right now')}</p>
                <p>
                  {t('Lots of people are exploring at the moment. Please try again in a minute.')}
                </p>
                <Button onClick={retry} className={styles.retry}>
                  {t('Try again')}
                </Button>
              </div>
            ) : (
              <ul
                className={styles.list}
                aria-label={t('Travel information for {0}', state.page.place.name)}
              >
                {state.page.cards.map((card) => (
                  <InfoCard key={card.id} card={card} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}

function Message({ title, text, onRetry }: { title: string; text: string; onRetry?: () => void }) {
  return (
    <section className={styles.message}>
      <Icon name="travel_explore" className={styles.messageIcon} />
      <h1 className={styles.messageTitle}>{title}</h1>
      <p className={styles.messageText}>{text}</p>
      {onRetry ? (
        <Button onClick={onRetry}>{t('Try again')}</Button>
      ) : (
        <ButtonLink to={routes.home}>{t('Search again')}</ButtonLink>
      )}
    </section>
  );
}
