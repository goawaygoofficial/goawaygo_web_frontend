import { Link } from 'react-router-dom';
import styles from './IconTile.module.css';

interface IconTileProps {
  title: string;
  imageSrc: string;
  /** Route to open. Omit to render the tile visibly disabled ("Coming soon"). */
  to?: string;
  /** `lg` for Home's categories, whose labels are a size up in the app (18 vs Profile's 16). */
  size?: 'md' | 'lg';
}

/**
 * Rounded secondary-light square with an image and a bold caption.
 * Used for Home's category buttons and Profile's tiles (the app's identical
 * `CategoryButton` and `ProfileButton`).
 */
export function IconTile({ title, imageSrc, to, size = 'md' }: IconTileProps) {
  const content = (
    <>
      <span className={styles.square}>
        <img src={imageSrc} alt="" className={styles.image} />
      </span>
      <span
        className={[styles.title, size === 'lg' && styles.titleLarge].filter(Boolean).join(' ')}
      >
        {title}
      </span>
    </>
  );

  if (to === undefined) {
    return (
      <span className={[styles.tile, styles.disabled].join(' ')} aria-disabled="true">
        {content}
        <span className={styles.badge}>Coming soon</span>
      </span>
    );
  }

  return (
    <Link to={to} className={styles.tile}>
      {content}
    </Link>
  );
}
