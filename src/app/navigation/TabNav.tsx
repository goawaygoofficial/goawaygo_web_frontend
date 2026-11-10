import { NavLink } from 'react-router-dom';
import homeIcon from '@/assets/icons/home.png';
import myTripsIcon from '@/assets/icons/mytrips.png';
import profileIcon from '@/assets/icons/profile.png';
import wanderbookIcon from '@/assets/icons/wanderbook.png';
import { MaskIcon } from '@/components';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './TabNav.module.css';
import { t } from '@/lib/i18n';

/** The app's 4-tab bar: bottom tab bar on phones, top bar on desktop (layout is pure CSS). */
export function TabNav() {
  const { user } = useUser();
  const tabs = [
    { to: routes.home, label: t('HOME'), icon: homeIcon },
    { to: routes.trips, label: t('MY TRIPS'), icon: myTripsIcon },
    { to: routes.wanderbook, label: 'WANDERBOOK', icon: wanderbookIcon },
    { to: routes.profile, label: user ? t('PROFILE') : t('SIGN IN'), icon: profileIcon },
  ];

  return (
    <nav className={styles.nav} aria-label={t('Main')}>
      <ul className={styles.list}>
        {tabs.map((tab) => (
          <li key={tab.to} className={styles.item}>
            <NavLink
              to={tab.to}
              end
              className={({ isActive }) =>
                [styles.link, isActive && styles.active].filter(Boolean).join(' ')
              }
            >
              <MaskIcon src={tab.icon} className={styles.icon} />
              <span className={styles.label}>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
