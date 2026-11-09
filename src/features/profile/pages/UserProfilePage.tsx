import { Navigate } from 'react-router-dom';
import userProfileIcon from '@/assets/icons/user_profile.png';
import { Button, ButtonLink, PageHeader, PageShell } from '@/components';
import { useSignOut } from '@/features/auth';
import { useBack } from '@/hooks';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import type { User } from '@/types';
import { ProfileField } from '../components/ProfileField';
import type { ProfileDetail } from '../types';
import styles from './UserProfilePage.module.css';

/** Shown where the backend has no data yet (the app hardcodes demo values for these rows). */
const NOT_SET = 'Not set';

function toProfileDetails(user: User): ProfileDetail[] {
  return [
    { label: 'Email', value: user.email },
    { label: 'Password', value: '**************', isSecret: true },
    { label: 'Phone Number', value: user.phone ?? NOT_SET },
    { label: 'Country / Region', value: NOT_SET },
    { label: 'Currency', value: NOT_SET },
    { label: 'Display Name', value: user.name },
  ];
}

export function UserProfilePage() {
  const { user } = useUser();
  const goBack = useBack(routes.profile);
  const { signOut, pending: signingOut, leaving } = useSignOut();

  // While signing out, render nothing instead of redirecting (see `useSignOut`'s `leaving`).
  if (!user) return leaving ? null : <Navigate to={routes.profile} replace />;

  return (
    <PageShell>
      <PageHeader>
        <h1 className={styles.title}>
          <img src={userProfileIcon} alt="" className={styles.titleIcon} />
          User Profile
        </h1>
      </PageHeader>
      <dl className={styles.fields}>
        {toProfileDetails(user).map((detail) => (
          <ProfileField key={detail.label} {...detail} />
        ))}
      </dl>
      <div className={styles.actions}>
        <ButtonLink fullWidth variant="outline" to={routes.notificationSettings}>
          Notification settings
        </ButtonLink>
        <Button fullWidth loading={signingOut} onClick={signOut}>
          Sign Out
        </Button>
        <Button variant="link" onClick={goBack}>
          Back
        </Button>
      </div>
    </PageShell>
  );
}
