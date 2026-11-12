import { Outlet } from 'react-router-dom';
import motionStyles from './PageMotion.module.css';
import { usePageMotion } from './usePageMotion';
import { TabNav } from '../navigation/TabNav';
import styles from './ShellLayout.module.css';
import { t } from '@/lib/i18n';

/** The four tab screens with the tab bar (bottom on mobile, top on desktop). */
export function ShellLayout() {
  const { key, motion } = usePageMotion();
  return (
    <div className={styles.shell}>
      {/* The first thing a keyboard reaches: past the tab bar to the page (WCAG 2.4.1). */}
      <a href="#content" className={styles.skip}>
        {t('Skip to content')}
      </a>
      <TabNav />
      <div id="content" tabIndex={-1} className={styles.content}>
        {/* Keyed by page, so each page plays its way in (see usePageMotion). */}
        <div key={key} className={motionStyles[motion]}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
