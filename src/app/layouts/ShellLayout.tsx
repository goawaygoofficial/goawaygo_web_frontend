import { Outlet } from 'react-router-dom';
import { TabNav } from '../navigation/TabNav';
import styles from './ShellLayout.module.css';

/** The four tab screens with the tab bar (bottom on mobile, top on desktop). */
export function ShellLayout() {
  return (
    <div className={styles.shell}>
      <TabNav />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
