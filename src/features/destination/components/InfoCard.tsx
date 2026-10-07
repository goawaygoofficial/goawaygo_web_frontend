import type { DestinationInfoItem } from '../types';
import styles from './InfoCard.module.css';

export function InfoCard({ item }: { item: DestinationInfoItem }) {
  const Icon = item.icon;
  return (
    <li className={styles.card}>
      <span className={styles.iconCircle} aria-hidden="true">
        <Icon />
      </span>
      <div>
        <h2 className={styles.title}>{item.title}</h2>
        <p className={styles.subtitle}>{item.subtitle}</p>
      </div>
    </li>
  );
}
