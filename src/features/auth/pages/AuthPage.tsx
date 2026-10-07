import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import emailIcon from '@/assets/icons/email.png';
import { Button, FeatureList, Logo, PageShell } from '@/components';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { SignInForm } from '../components/SignInForm';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const { user } = useUser();
  // Only redirect users who were already signed in when they arrived; a fresh sign-in
  // navigates itself after the welcome dialog.
  const [arrivedSignedIn] = useState(user !== null);
  const { pathname } = useLocation();
  const [showForm, setShowForm] = useState(false);

  if (arrivedSignedIn) return <Navigate to={routes.home} replace />;

  const overlayOpen = pathname !== routes.auth;

  return (
    <>
      <PageShell className={styles.page}>
        <div inert={overlayOpen} className={styles.screen}>
          <header className={styles.header}>
            <Logo size="lg" />
            <Link to={routes.home} className={styles.skip}>
              SKIP
            </Link>
          </header>
          <h1 className="visually-hidden">Sign in to Goaway</h1>
          <FeatureList />

          <div className={styles.crossFade}>
            <div
              className={[styles.state, !showForm && styles.visible].filter(Boolean).join(' ')}
              inert={showForm}
            >
              <GoogleSignInButton />
              <Button
                fullWidth
                icon={<img src={emailIcon} alt="" />}
                onClick={() => {
                  setShowForm(true);
                }}
              >
                SIGN IN
              </Button>
            </div>
            <div
              className={[styles.state, showForm && styles.visible].filter(Boolean).join(' ')}
              inert={!showForm}
            >
              {showForm && (
                <SignInForm
                  onClose={() => {
                    setShowForm(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </PageShell>
      <Outlet />
    </>
  );
}
