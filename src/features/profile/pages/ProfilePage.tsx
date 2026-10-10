import { useNavigate } from 'react-router-dom';
import myTripsIcon from '@/assets/icons/mytrips_white.png';
import recentlyViewedIcon from '@/assets/icons/recently_viewed.png';
import reviewIcon from '@/assets/icons/review.png';
import rewardsIcon from '@/assets/icons/rewards.png';
import savedIcon from '@/assets/icons/saved.png';
import userProfileIcon from '@/assets/icons/user_profile.png';
import { Button, FeatureList, IconTile, Logo, PageHeader, PageShell } from '@/components';
import { GoogleSignInButton, SignOutIconButton } from '@/features/auth';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './ProfilePage.module.css';

/** Tiles without a `to` have no screen in the app yet and render as "Coming soon". */
const PROFILE_TILES = [
  { title: 'My Trips', imageSrc: myTripsIcon, to: routes.trips },
  { title: 'Recently Viewed', imageSrc: recentlyViewedIcon },
  { title: 'Saved', imageSrc: savedIcon },
  { title: 'Reviews', imageSrc: reviewIcon },
  { title: 'Rewards', imageSrc: rewardsIcon },
  { title: 'User Profile', imageSrc: userProfileIcon, to: routes.profileDetails },
] as const;

export function ProfilePage() {
  const { user } = useUser();
  return user ? <SignedInProfile name={user.name} /> : <GuestProfile />;
}

function SignedInProfile({ name }: { name: string }) {
  return (
    <PageShell>
      <PageHeader showNotifications actions={<SignOutIconButton />} />
      <h1 className={styles.greeting}>Hi, {name}</h1>
      <nav aria-label="Profile" className={styles.grid}>
        {PROFILE_TILES.map((tile) => (
          <IconTile key={tile.title} {...tile} />
        ))}
      </nav>
    </PageShell>
  );
}

function GuestProfile() {
  const navigate = useNavigate();
  return (
    <PageShell className={styles.guest}>
      <Logo size="lg" />
      <h1 className="visually-hidden">Sign in to Goaway</h1>
      <FeatureList />
      {/* Same order as the sign-in page. Signing in here keeps the user on their profile. */}
      <div className={styles.guestActions}>
        <GoogleSignInButton redirectTo={routes.profile} />
        <Button
          fullWidth
          onClick={() => {
            void navigate(routes.auth);
          }}
        >
          SIGN IN
        </Button>
      </div>
    </PageShell>
  );
}
