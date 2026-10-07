import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Logo } from '@/components';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { WaveBackground } from '../components/WaveBackground';
import styles from './SplashPage.module.css';

/** How long the splash stays up, as in the app. */
const SPLASH_DURATION_MS = 3000;

export function SplashPage() {
  const { user, status } = useUser();
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setElapsed(true);
    }, SPLASH_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // Wait for both the splash timer and the stored-user check before deciding where to go.
  if (elapsed && status === 'ready') {
    return <Navigate to={user ? routes.home : routes.auth} replace />;
  }

  return (
    <main className={styles.splash} aria-busy="true">
      <h1 className="visually-hidden">Goaway</h1>
      <Logo size="splash" className={styles.logo} />
      <WaveBackground />
    </main>
  );
}
