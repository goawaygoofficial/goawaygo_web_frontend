import { Navigate, Outlet, useLocation } from 'react-router-dom';
import myTripsIcon from '@/assets/icons/mytrips_white.png';
import recentlyViewedIcon from '@/assets/icons/recently_viewed.png';
import reviewIcon from '@/assets/icons/review.png';
import rewardsIcon from '@/assets/icons/rewards.png';
import savedIcon from '@/assets/icons/saved.png';
import userProfileIcon from '@/assets/icons/user_profile.png';
import { FeatureList, IconTile, Logo, PageHeader, PageShell } from '@/components';
import { SignInPanel, VerifyEmailBanner, authFlows } from '@/features/auth';
import { LegalLinks } from '@/features/legal';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { LocalePickers } from '../components/LocalePickers';
import styles from './ProfilePage.module.css';
import { t } from '@/lib/i18n';

/** Tiles without a `to` have no screen in the app yet and render as "Coming soon". */
const PROFILE_TILES = [
  { title: 'My Trips', imageSrc: myTripsIcon, to: routes.trips },
  { title: 'Recently Viewed', imageSrc: recentlyViewedIcon, to: routes.recentlyViewed },
  { title: 'Saved', imageSrc: savedIcon },
  { title: 'Reviews', imageSrc: reviewIcon },
  { title: 'Rewards', imageSrc: rewardsIcon },
  { title: 'User Profile', imageSrc: userProfileIcon, to: routes.profileDetails },
] as const;

export function ProfilePage() {
  const { user } = useUser();
  const { pathname } = useLocation();
  if (!user) return <GuestProfile overlayOpen={pathname !== routes.profile} />;
  // Register / Forgot Password are for signed-out users only.
  if (pathname !== routes.profile) return <Navigate to={routes.profile} replace />;
  return <SignedInProfile name={user.name} />;
}

function SignedInProfile({ name }: { name: string }) {
  return (
    <PageShell>
      <PageHeader />
      <VerifyEmailBanner />
      <h1 className={styles.greeting}>{t('Hi, {0}', name)}</h1>
      <nav aria-label={t('Profile')} className={styles.grid}>
        {PROFILE_TILES.map((tile) => (
          <IconTile key={tile.title} {...tile} title={t(tile.title)} />
        ))}
      </nav>
      <LocalePickers currency={false} />
      <LegalLinks />
    </PageShell>
  );
}

/** Signs in right here, like the sign-in page: Google, or the email form that opens in place. */
function GuestProfile({ overlayOpen }: { overlayOpen: boolean }) {
  return (
    <>
      <PageShell className={styles.guest} as={overlayOpen ? 'div' : 'main'}>
        <div inert={overlayOpen} className={styles.guestContent}>
          <Logo size="lg" />
          <h1 className="visually-hidden">{t('Sign in to GoAwayGo')}</h1>
          <FeatureList />
          <div className={styles.guestActions}>
            <SignInPanel flow={authFlows.profile} />
          </div>
          <LocalePickers currency />
          <LegalLinks />
        </div>
      </PageShell>
      <Outlet context={authFlows.profile} />
    </>
  );
}
