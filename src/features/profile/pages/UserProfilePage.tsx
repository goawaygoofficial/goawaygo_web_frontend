import { Navigate, useNavigate } from 'react-router-dom';
import userProfileIcon from '@/assets/icons/user_profile.png';
import { Button, PageHeader, PageShell } from '@/components';
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
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const goBack = useBack(routes.profile);

  if (!user) return <Navigate to={routes.profile} replace />;

  const signOut = () => {
    clearUser();
    void navigate(routes.auth, { replace: true });
  };

  return (
    <PageShell>
      <PageHeader showNotifications>
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
        <Button fullWidth onClick={signOut}>
          Sign Out
        </Button>
        <Button variant="link" onClick={goBack}>
          Back
        </Button>
      </div>
    </PageShell>
  );
}
