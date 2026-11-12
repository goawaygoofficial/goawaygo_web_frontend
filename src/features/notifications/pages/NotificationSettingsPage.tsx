import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button, Icon, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { getSettings, saveSettings } from '../services/notificationsService';
import type { NotificationSettings } from '../types';
import styles from './NotificationSettingsPage.module.css';
import { t } from '@/lib/i18n';

const SWITCHES: { key: keyof NotificationSettings; title: string; text: string }[] = [
  {
    key: 'wanderbook',
    title: 'Wanderbook',
    text: 'New followers, follow requests, likes and comments on your posts.',
  },
  {
    key: 'tripReminders',
    title: 'Trip reminders',
    text: 'Three days before a planned trip, and the day before.',
  },
  {
    key: 'sharedPlans',
    title: 'Shared trip plans',
    text: 'When someone opens a plan you shared (at most once a day).',
  },
  { key: 'announcements', title: 'News from GoAwayGo', text: 'New features and beta builds.' },
];

/** A switch per kind of push the app sends; each change saves at once. Signed in only. */
export function NotificationSettingsPage() {
  const { user, status } = useUser();
  const goBack = useBack(routes.notifications);
  const userId = user?.id;
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${String(userId)}|${String(attempt)}`;
  const [loaded, setLoaded] = useState<{
    requestKey: string;
    settings?: NotificationSettings;
    error?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    if (userId === undefined) return;
    const controller = new AbortController();
    getSettings(controller.signal).then(
      (settings) => {
        setLoaded({ requestKey, settings });
      },
      (cause: unknown) => {
        if (!controller.signal.aborted) setLoaded({ requestKey, error: toErrorMessage(cause) });
      },
    );
    return () => {
      controller.abort();
    };
  }, [userId, requestKey]);

  if (status !== 'restoring' && !user) return <Navigate to={routes.notifications} replace />;
  const current = loaded?.requestKey === requestKey ? loaded : null;

  const toggle = (settings: NotificationSettings, key: keyof NotificationSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setLoaded({ requestKey, settings: next });
    setSaving(true);
    setSaveError(undefined);
    saveSettings(next)
      .then((saved) => {
        setLoaded({ requestKey, settings: saved });
      })
      .catch((cause: unknown) => {
        setLoaded({ requestKey, settings });
        setSaveError(toErrorMessage(cause));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.titleRow}>
        <Icon name="notifications" className={styles.titleIcon} />
        <h1 className={styles.title}>{t('Notification settings')}</h1>
      </div>
      <p className={styles.intro}>
        {t(
          'Choose which push notifications the GoAwayGo Android app sends you. The bell always lists everything.',
        )}
      </p>

      {current?.error ? (
        <section className={styles.panel} role="alert">
          <p>{current.error}</p>
          <Button
            onClick={() => {
              setAttempt((value) => value + 1);
            }}
          >
            {t('Try again')}
          </Button>
        </section>
      ) : !current?.settings ? (
        <p className={styles.intro} role="status">
          {t('Loading…')}
        </p>
      ) : (
        <ul className={styles.list}>
          {SWITCHES.map(({ key, title, text }) => {
            const settings = current.settings;
            if (!settings) return null;
            return (
              <li key={key}>
                <label className={styles.row}>
                  <span className={styles.text}>
                    <span className={styles.name}>{t(title)}</span>
                    <span className={styles.description}>{t(text)}</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    className={styles.switch}
                    checked={settings[key]}
                    disabled={saving}
                    onChange={() => {
                      toggle(settings, key);
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
    </PageShell>
  );
}
