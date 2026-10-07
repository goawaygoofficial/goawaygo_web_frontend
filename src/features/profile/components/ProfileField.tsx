import type { ProfileDetail } from '../types';
import styles from './ProfileField.module.css';

/** Orange rounded row: label on the left, value right-aligned. */
export function ProfileField({ label, value, isSecret = false }: ProfileDetail) {
  return (
    <div className={styles.row}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>
        {isSecret ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span className="visually-hidden">Hidden</span>
          </>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
