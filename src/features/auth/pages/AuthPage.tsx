import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { FeatureList, Logo, PageShell } from '@/components';
import { routes } from '@/lib/routes';
import { GetAppLink } from '@/features/getApp';
import { LegalLinks } from '@/features/legal';
import { useUser } from '@/providers';
import { authFlows } from '../authFlow';
import { SignInPanel } from '../components/SignInPanel';
import styles from './AuthPage.module.css';
import { t } from '@/lib/i18n';

export function AuthPage() {
  const { user } = useUser();
  // Only redirect users who were already signed in when they arrived; a fresh sign-in
  // navigates itself after the welcome dialog.
  const [arrivedSignedIn] = useState(user !== null);
  const { pathname } = useLocation();

  if (arrivedSignedIn) return <Navigate to={routes.home} replace />;

  const overlayOpen = pathname !== routes.auth;

  return (
    <>
      <PageShell className={styles.page}>
        <div inert={overlayOpen} className={styles.screen}>
          <header className={styles.header}>
            <Logo size="lg" />
            <Link to={routes.home} className={styles.skip}>
              {t('SKIP')}
            </Link>
          </header>
          <h1 className="visually-hidden">{t('Sign in to GoAwayGo')}</h1>
          <FeatureList />

          <SignInPanel flow={authFlows.signInPage} />
          <GetAppLink className={styles.getApp} />
          <LegalLinks />
        </div>
      </PageShell>
      <Outlet context={authFlows.signInPage} />
    </>
  );
}
