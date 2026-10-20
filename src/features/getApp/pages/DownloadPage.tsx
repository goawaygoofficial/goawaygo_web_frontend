import { Icon, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { appLinks } from '@/lib/appLinks';
import { routes } from '@/lib/routes';
import { useLatestAndroidRelease } from '../hooks/useLatestAndroidRelease';
import type { AndroidRelease } from '../types';
import styles from './DownloadPage.module.css';

function megabytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/**
 * Get the Android app. Before launch: direct APK download (from latest.json) and the beta sign-up. Once
 * `appLinks.playStoreUrl` is set, only the Play Store.
 */
export function DownloadPage() {
  const goBack = useBack(routes.home);

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <h1 className={styles.heading}>Get Goaway for Android</h1>
      {appLinks.playStoreUrl ? (
        <section className={styles.card}>
          <p className={styles.text}>Install Goaway from Google Play.</p>
          <a
            className={styles.primary}
            href={appLinks.playStoreUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="android" />
            Get it on Google Play
          </a>
        </section>
      ) : (
        <>
          <p className={styles.lead}>
            Goaway is in beta. It's free and needs Android 8.0 or newer; the iPhone version comes
            later.
          </p>
          <DirectDownload />
          {appLinks.androidBetaUrl && <BetaSignUp />}
        </>
      )}
    </PageShell>
  );
}

function DirectDownload() {
  const state = useLatestAndroidRelease();

  return (
    <section className={styles.card} aria-labelledby="download-heading">
      <h2 id="download-heading" className={styles.cardTitle}>
        Download the app
      </h2>
      {state.kind === 'loading' && <p className={styles.text}>Checking the latest version…</p>}
      {state.kind === 'unavailable' && (
        <p className={styles.text}>
          The download isn't available right now. Please try again later
          {appLinks.androidBetaUrl ? ', or join the beta below.' : '.'}
        </p>
      )}
      {state.kind === 'ready' && <ReleaseDetails release={state.release} />}
    </section>
  );
}

function ReleaseDetails({ release }: { release: AndroidRelease }) {
  return (
    <>
      <p className={styles.meta}>
        Version {release.version} ({release.build}) · {release.date} ·{' '}
        {megabytes(release.arm64.size)}
      </p>
      {release.notes && <p className={styles.text}>{release.notes}</p>}
      <a className={styles.primary} href={release.arm64.url} download>
        <Icon name="download" />
        Download for Android
      </a>
      {release.universal && (
        <p className={styles.small}>
          Doesn't install on your phone (older 32-bit models)?{' '}
          <a className={styles.link} href={release.universal.url} download>
            Download the version for all phones ({megabytes(release.universal.size)})
          </a>
        </p>
      )}

      <h3 className={styles.stepsTitle}>How to install</h3>
      <ol className={styles.steps}>
        <li>Tap “Download for Android” and open the file when it finishes.</li>
        <li>
          If Android asks, allow your browser to <strong>install unknown apps</strong> (Settings
          opens; switch it on, then go back).
        </li>
        <li>Tap “Install”, then “Open”.</li>
        <li>For a new version, download it again from this page; your account stays signed in.</li>
      </ol>

      <details className={styles.details}>
        <summary>Check the file (SHA-256)</summary>
        <p className={styles.small}>
          The file you downloaded should have this fingerprint. Android also checks that every
          update is signed by Goaway.
        </p>
        <code className={styles.hash}>{release.arm64.sha256}</code>
        {release.universal && (
          <>
            <p className={styles.small}>All-phones version:</p>
            <code className={styles.hash}>{release.universal.sha256}</code>
          </>
        )}
      </details>
    </>
  );
}

function BetaSignUp() {
  return (
    <section className={styles.card} aria-labelledby="beta-heading">
      <h2 id="beta-heading" className={styles.cardTitle}>
        Join the beta testers
      </h2>
      <p className={styles.text}>
        Get notified of every new version and send us feedback from the app. You sign up with your
        email and install through Google's Firebase App Tester.
      </p>
      <a
        className={styles.secondary}
        href={appLinks.androidBetaUrl}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="open_in_new" />
        Join the beta
      </a>
    </section>
  );
}
