import { Icon, PageHeader, PageShell } from '@/components';
import { LegalLinks } from '@/features/legal';
import { useBack } from '@/hooks';
import { track } from '@/lib/analytics';
import { appLinks } from '@/lib/appLinks';
import { routes } from '@/lib/routes';
import { useLatestAndroidRelease } from '../hooks/useLatestAndroidRelease';
import type { AndroidRelease } from '../types';
import styles from './DownloadPage.module.css';
import { t } from '@/lib/i18n';

function megabytes(bytes: number): string {
  return t('{0} MB', (bytes / 1_000_000).toFixed(1));
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
      <h1 className={styles.heading}>{t('Get GoAwayGo for Android')}</h1>
      {appLinks.playStoreUrl ? (
        <section className={styles.card}>
          <p className={styles.text}>{t('Install GoAwayGo from Google Play.')}</p>
          <a
            className={styles.primary}
            href={appLinks.playStoreUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="android" />
            {t('Get it on Google Play')}
          </a>
        </section>
      ) : (
        <>
          <p className={styles.lead}>
            {t(
              "GoAwayGo is in beta. It's free and needs Android 8.0 or newer; the iPhone version comes later.",
            )}
          </p>
          <DirectDownload />
          {appLinks.androidBetaUrl && <BetaSignUp />}
        </>
      )}
      <LegalLinks />
    </PageShell>
  );
}

function DirectDownload() {
  const state = useLatestAndroidRelease();

  return (
    <section className={styles.card} aria-labelledby="download-heading">
      <h2 id="download-heading" className={styles.cardTitle}>
        {t('Download the app')}
      </h2>
      {state.kind === 'loading' && (
        <p className={styles.text}>{t('Checking the latest version…')}</p>
      )}
      {state.kind === 'unavailable' && (
        <p className={styles.text}>
          {appLinks.androidBetaUrl
            ? t(
                "The download isn't available right now. Please try again later, or join the beta below.",
              )
            : t("The download isn't available right now. Please try again later.")}
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
        {t('Version {0} ({1})', release.version, release.build)} · {release.date} ·{' '}
        {megabytes(release.arm64.size)}
      </p>
      {release.notes && <p className={styles.text}>{release.notes}</p>}
      <a
        className={styles.primary}
        href={release.arm64.url}
        download
        onClick={() => {
          track({ name: 'app_download_clicked', props: { variant: 'arm64' } });
        }}
      >
        <Icon name="download" />
        {t('Download for Android')}
      </a>
      {release.universal && (
        <p className={styles.small}>
          {t("Doesn't install on your phone (older 32-bit models)?")}{' '}
          <a
            className={styles.link}
            href={release.universal.url}
            download
            onClick={() => {
              track({ name: 'app_download_clicked', props: { variant: 'universal' } });
            }}
          >
            {t('Download the version for all phones ({0})', megabytes(release.universal.size))}
          </a>
        </p>
      )}

      <h3 className={styles.stepsTitle}>{t('How to install')}</h3>
      <ol className={styles.steps}>
        <li>{t('Tap “Download for Android” and open the file when it finishes.')}</li>
        <li>
          {t('If Android asks, allow your browser to')} <strong>{t('install unknown apps')}</strong>{' '}
          {t('(Settings opens; switch it on, then go back).')}
        </li>
        <li>{t('Tap “Install”, then “Open”.')}</li>
        <li>
          {t('For a new version, download it again from this page; your account stays signed in.')}
        </li>
      </ol>

      <details className={styles.details}>
        <summary>{t('Check the file (SHA-256)')}</summary>
        <p className={styles.small}>
          {t(
            'The file you downloaded should have this fingerprint. Android also checks that every update is signed by GoAwayGo.',
          )}
        </p>
        <code className={styles.hash}>{release.arm64.sha256}</code>
        {release.universal && (
          <>
            <p className={styles.small}>{t('All-phones version:')}</p>
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
        {t('Join the beta testers')}
      </h2>
      <p className={styles.text}>
        {t(
          "Get notified of every new version and send us feedback from the app. You sign up with your email and install through Google's Firebase App Tester.",
        )}
      </p>
      <a
        className={styles.secondary}
        href={appLinks.androidBetaUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          track({ name: 'beta_join_clicked' });
        }}
      >
        <Icon name="open_in_new" />
        {t('Join the beta')}
      </a>
    </section>
  );
}
